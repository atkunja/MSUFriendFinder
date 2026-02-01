'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Class, UserClass } from '@/types/database'

interface ClassWithDetails extends Class {
  userClass: UserClass
  classmatesCount: number
}

interface ClassmateWithProfile {
  user: Profile
  section: string | null
}

const SEMESTERS = [
  'Spring 2025',
  'Fall 2024',
  'Spring 2024',
  'Fall 2023',
]

export default function ClassesPage() {
  const [userClasses, setUserClasses] = useState<ClassWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(null)
  const [classmates, setClassmates] = useState<ClassmateWithProfile[]>([])
  const [loadingClassmates, setLoadingClassmates] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Class[]>([])
  const [searching, setSearching] = useState(false)
  const [newClass, setNewClass] = useState({
    course_code: '',
    course_name: '',
    semester: 'Spring 2025',
    section: '',
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setCurrentUser(profile)

    // Fetch user's classes
    const { data: userClassesData } = await supabase
      .from('user_classes')
      .select('*, class:classes(*)')
      .eq('user_id', user.id)
      .order('semester', { ascending: false })

    if (userClassesData) {
      // Get classmate counts for each class
      const classIds = userClassesData.map(uc => uc.class_id)
      const { data: allUserClasses } = await supabase
        .from('user_classes')
        .select('class_id, user_id')
        .in('class_id', classIds)

      const classmatesMap = new Map<string, number>()
      allUserClasses?.forEach(uc => {
        if (uc.user_id !== user.id) {
          classmatesMap.set(uc.class_id, (classmatesMap.get(uc.class_id) || 0) + 1)
        }
      })

      const classesWithDetails: ClassWithDetails[] = userClassesData.map(uc => ({
        ...(uc.class as Class),
        userClass: uc as UserClass,
        classmatesCount: classmatesMap.get(uc.class_id) || 0,
      }))

      setUserClasses(classesWithDetails)
    }

    setLoading(false)
  }

  const searchClasses = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    const { data } = await supabase
      .from('classes')
      .select('*')
      .or(`course_code.ilike.%${query}%,course_name.ilike.%${query}%`)
      .limit(10)

    setSearchResults(data || [])
    setSearching(false)
  }

  const addClass = async (classToAdd?: Class) => {
    if (!currentUser) return

    setAdding(true)

    let classId: string

    if (classToAdd) {
      classId = classToAdd.id
    } else {
      // Create new class if it doesn't exist
      if (!newClass.course_code.trim() || !newClass.course_name.trim()) {
        setAdding(false)
        return
      }

      const { data: existingClass } = await supabase
        .from('classes')
        .select('id')
        .eq('course_code', newClass.course_code.toUpperCase())
        .single()

      if (existingClass) {
        classId = existingClass.id
      } else {
        const { data: createdClass, error: createError } = await supabase
          .from('classes')
          .insert({
            course_code: newClass.course_code.toUpperCase(),
            course_name: newClass.course_name.trim(),
          })
          .select('id')
          .single()

        if (createError || !createdClass) {
          setAdding(false)
          return
        }
        classId = createdClass.id
      }
    }

    // Add user to class
    const { error } = await supabase.from('user_classes').insert({
      user_id: currentUser.id,
      class_id: classId,
      semester: newClass.semester,
      section: newClass.section.trim() || null,
    })

    if (!error) {
      setNewClass({ course_code: '', course_name: '', semester: 'Spring 2025', section: '' })
      setSearchQuery('')
      setSearchResults([])
      setShowAddForm(false)
      fetchData()
    }

    setAdding(false)
  }

  const removeClass = async (userClassId: string) => {
    await supabase.from('user_classes').delete().eq('id', userClassId)
    setSelectedClass(null)
    fetchData()
  }

  const viewClassmates = async (classInfo: ClassWithDetails) => {
    setSelectedClass(classInfo)
    setLoadingClassmates(true)

    const { data: classmatesData } = await supabase
      .from('user_classes')
      .select('section, user:profiles(*)')
      .eq('class_id', classInfo.id)
      .eq('semester', classInfo.userClass.semester)
      .neq('user_id', currentUser?.id)

    if (classmatesData) {
      const classmates: ClassmateWithProfile[] = classmatesData.map(cm => ({
        user: cm.user as unknown as Profile,
        section: cm.section,
      }))
      setClassmates(classmates)
    }

    setLoadingClassmates(false)
  }

  const startGroupChat = async (classInfo: ClassWithDetails) => {
    if (!currentUser) return

    const { data: conversationId } = await supabase.rpc('get_or_create_class_chat', {
      p_class_id: classInfo.id,
      p_semester: classInfo.userClass.semester,
    })

    if (conversationId) {
      router.push(`/messages/${conversationId}`)
    }
  }

  // Group classes by semester
  const classesBySemester = userClasses.reduce((acc, cls) => {
    const semester = cls.userClass.semester
    if (!acc[semester]) acc[semester] = []
    acc[semester].push(cls)
    return acc
  }, {} as Record<string, ClassWithDetails[]>)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-msu-green/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-msu-accent/5 blur-[120px] rounded-full -z-10" />

      <div className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Classes</h1>
          <p className="text-gray-500 font-bold text-sm mt-1">Find classmates and study partners</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-prestige !py-2 !px-4 !text-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Class'}
        </button>
      </div>

      {/* Add Class Form */}
      {showAddForm && (
        <div className="card-prestige !p-6 mb-6 animate-fade-in">
          <h3 className="font-black text-gray-800 mb-4">Add a Class</h3>

          {/* Search existing classes */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                searchClasses(e.target.value)
              }}
              placeholder="Search for a class (e.g., CSE 231, Intro to Programming)"
              className="input-prestige"
            />

            {searching && (
              <p className="text-sm text-gray-400 mt-2">Searching...</p>
            )}

            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                {searchResults.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => {
                      setNewClass({
                        ...newClass,
                        course_code: cls.course_code,
                        course_name: cls.course_name,
                      })
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-msu-green/5 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <span className="font-bold text-msu-green">{cls.course_code}</span>
                    <span className="text-gray-600 ml-2">{cls.course_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-center text-gray-400 text-sm mb-4">or add a new class</div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={newClass.course_code}
                onChange={(e) => setNewClass({ ...newClass, course_code: e.target.value })}
                placeholder="Course code (e.g., CSE 231)"
                className="input-prestige"
              />
              <select
                value={newClass.semester}
                onChange={(e) => setNewClass({ ...newClass, semester: e.target.value })}
                className="input-prestige"
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={newClass.course_name}
              onChange={(e) => setNewClass({ ...newClass, course_name: e.target.value })}
              placeholder="Course name (e.g., Intro to Programming)"
              className="input-prestige"
            />
            <input
              type="text"
              value={newClass.section}
              onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
              placeholder="Section (optional, e.g., 001)"
              className="input-prestige"
            />
            <button
              onClick={() => addClass()}
              disabled={!newClass.course_code.trim() || !newClass.course_name.trim() || adding}
              className="btn-prestige w-full disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add Class'}
            </button>
          </div>
        </div>
      )}

      {/* Classes List */}
      {userClasses.length === 0 ? (
        <div className="card-prestige text-center py-16 animate-fade-in">
          <span className="text-6xl block mb-4">📚</span>
          <h3 className="text-xl font-black text-gray-800 mb-2">No classes added yet</h3>
          <p className="text-gray-500 font-medium">
            Add your classes to find study partners and classmates!
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {Object.entries(classesBySemester).map(([semester, classes]) => (
            <div key={semester}>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{semester}</h2>
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div
                    key={cls.userClass.id}
                    className="card-prestige !p-5 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => viewClassmates(cls)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-msu-green/10 flex items-center justify-center">
                          <span className="text-xl">📖</span>
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900">{cls.course_code}</h3>
                          <p className="text-sm text-gray-500">{cls.course_name}</p>
                          {cls.userClass.section && (
                            <p className="text-xs text-msu-green font-bold mt-0.5">Section {cls.userClass.section}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {cls.classmatesCount} classmate{cls.classmatesCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-gray-300">→</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Classmates Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedClass(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedClass.course_code}</h2>
                  <p className="text-sm text-gray-500">{selectedClass.course_name}</p>
                  <p className="text-xs text-msu-green font-bold mt-1">{selectedClass.userClass.semester}</p>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => startGroupChat(selectedClass)}
                  className="btn-prestige !py-2 !px-4 !text-sm flex-1"
                >
                  Join Class Chat
                </button>
                <button
                  onClick={() => removeClass(selectedClass.userClass.id)}
                  className="btn-secondary-prestige !py-2 !px-4 !text-sm !text-red-500 !border-red-200 hover:!bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Classmates</h3>

              {loadingClassmates ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : classmates.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No classmates yet. Share this class to find study partners!</p>
              ) : (
                <div className="space-y-3">
                  {classmates.map((cm) => (
                    <Link
                      key={cm.user.id}
                      href={`/profile/${cm.user.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {cm.user.avatar_url ? (
                          <img src={cm.user.avatar_url} alt={cm.user.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl flex items-center justify-center h-full">👤</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900">{cm.user.full_name}</h4>
                        <p className="text-sm text-gray-500">
                          {cm.user.major || 'MSU Student'}
                          {cm.section && <span className="text-msu-green ml-2">Section {cm.section}</span>}
                        </p>
                      </div>
                      <span className="text-gray-300">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
