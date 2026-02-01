'use client'

// Force dynamic rendering - this page uses Supabase which requires runtime env vars
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImageCropper from '@/components/ImageCropper'
import PhotoGallery from '@/components/PhotoGallery'
import type { Profile, ProfilePhoto, YearType } from '@/types/database'

const INTERESTS = [
  'Basketball', 'Soccer', 'Football', 'Gaming', 'Music', 'Movies',
  'Reading', 'Hiking', 'Cooking', 'Photography', 'Art', 'Dance',
  'Fitness', 'Yoga', 'Running', 'Swimming', 'Tennis', 'Golf',
  'Coding', 'Startups', 'Finance', 'Marketing', 'Design', 'Writing',
  'Travel', 'Food', 'Fashion', 'Volunteering', 'Politics', 'Science'
]

const LOOKING_FOR = [
  'Friends', 'Study Partners', 'Gym Buddy', 'Roommate', 'Project Partners',
  'Sports Teams', 'Club Members', 'Mentors', 'Networking', 'Dating'
]

const YEARS: YearType[] = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad', 'Other']

const CAMPUS_AREAS = [
  'North Neighborhood', 'South Neighborhood', 'East Neighborhood',
  'Brody Neighborhood', 'River Trail Neighborhood', 'Off Campus'
]

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    full_name: '',
    pronouns: '',
    major: '',
    year: '' as YearType | '',
    bio: '',
    interests: [] as string[],
    looking_for: [] as string[],
    campus_area: '',
  })

  const [avatarFile, setAvatarFile] = useState<Blob | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [showCopied, setShowCopied] = useState(false)
  const [photos, setPhotos] = useState<ProfilePhoto[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [showDangerZone, setShowDangerZone] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deletingPosts, setDeletingPosts] = useState(false)
  const [deletingPhotos, setDeletingPhotos] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData) {
      router.push('/onboarding')
      return
    }

    setProfile(profileData)
    setFormData({
      full_name: profileData.full_name,
      pronouns: profileData.pronouns || '',
      major: profileData.major || '',
      year: profileData.year || '',
      bio: profileData.bio || '',
      interests: profileData.interests || [],
      looking_for: profileData.looking_for || [],
      campus_area: profileData.campus_area || '',
    })
    setAvatarPreview(profileData.avatar_url)

    // Fetch profile photos
    const { data: photosData } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('display_order', { ascending: true })

    setPhotos(photosData || [])
    setLoading(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB')
        return
      }
      setRawImageSrc(URL.createObjectURL(file))
      setShowCropper(true)
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    setAvatarFile(croppedBlob)
    setAvatarPreview(URL.createObjectURL(croppedBlob))
    setShowCropper(false)
    setRawImageSrc(null)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setRawImageSrc(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const toggleLookingFor = (item: string) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.includes(item)
        ? prev.looking_for.filter(i => i !== item)
        : [...prev.looking_for, item]
    }))
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !profile) return null

    const filePath = `${profile.id}/avatar.jpg`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        upsert: true,
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return `${data.publicUrl}?t=${Date.now()}`
  }

  const handleGalleryPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setUploadingPhoto(true)
    setError('')

    try {
      const photoId = crypto.randomUUID()
      const filePath = `${profile.id}/${photoId}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const photoUrl = `${data.publicUrl}?t=${Date.now()}`

      // Insert into profile_photos table
      const { data: newPhoto, error: insertError } = await supabase
        .from('profile_photos')
        .insert({
          user_id: profile.id,
          photo_url: photoUrl,
          display_order: photos.length,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setPhotos(prev => [...prev, newPhoto])
      setSuccess('Photo added!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
      if (galleryInputRef.current) {
        galleryInputRef.current.value = ''
      }
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!profile) return

    try {
      const photoToDelete = photos.find(p => p.id === photoId)
      if (!photoToDelete) return

      // Delete from database
      const { error } = await supabase
        .from('profile_photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error

      // Try to delete from storage (extract path from URL)
      const urlParts = photoToDelete.photo_url.split('/avatars/')
      if (urlParts[1]) {
        const storagePath = urlParts[1].split('?')[0]
        await supabase.storage.from('avatars').remove([storagePath])
      }

      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete photo')
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let avatarUrl = profile.avatar_url

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          pronouns: formData.pronouns || null,
          major: formData.major || null,
          year: formData.year || null,
          bio: formData.bio || null,
          interests: formData.interests,
          looking_for: formData.looking_for,
          campus_area: formData.campus_area || null,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile({
        ...profile,
        ...formData,
        avatar_url: avatarUrl,
      } as Profile)
      setSuccess('Profile updated successfully!')
      setEditing(false)
      setAvatarFile(null)
    } catch {
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const shareProfile = async () => {
    if (!profile) return
    const profileUrl = `${window.location.origin}/profile/${profile.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name} on SpartanFinder`,
          text: `Check out my profile on SpartanFinder!`,
          url: profileUrl,
        })
      } catch {
        copyToClipboard(profileUrl)
      }
    } else {
      copyToClipboard(profileUrl)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }

  const deleteAllPosts = async () => {
    if (!profile) return
    if (!confirm('Delete all your posts? This cannot be undone.')) return

    setDeletingPosts(true)
    const { error } = await supabase
      .from('spontaneous_posts')
      .delete()
      .eq('user_id', profile.id)

    if (!error) {
      setSuccess('All posts deleted')
      setTimeout(() => setSuccess(''), 2000)
    } else {
      setError('Failed to delete posts')
    }
    setDeletingPosts(false)
  }

  const deleteAllPhotos = async () => {
    if (!profile) return
    if (!confirm('Delete all your gallery photos? This cannot be undone.')) return

    setDeletingPhotos(true)
    const { error } = await supabase
      .from('profile_photos')
      .delete()
      .eq('user_id', profile.id)

    if (!error) {
      setPhotos([])
      setSuccess('All photos deleted')
      setTimeout(() => setSuccess(''), 2000)
    } else {
      setError('Failed to delete photos')
    }
    setDeletingPhotos(false)
  }

  const deleteAccount = async () => {
    if (!profile || deleteConfirmText !== 'DELETE') return

    setDeleting(true)
    setError('')

    try {
      // Delete profile photos from storage
      const { data: storageFiles } = await supabase.storage
        .from('avatars')
        .list(profile.id)

      if (storageFiles && storageFiles.length > 0) {
        const filePaths = storageFiles.map(f => `${profile.id}/${f.name}`)
        await supabase.storage.from('avatars').remove(filePaths)
      }

      // Delete user data (cascades should handle related tables)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id)

      if (deleteError) throw deleteError

      // Sign out
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete account. Please try again.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 w-32 bg-foreground-subtle/30 rounded-full mx-auto"></div>
          <div className="h-8 bg-foreground-subtle/30 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-foreground-subtle/30 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-msu-green/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-msu-accent/5 blur-[120px] rounded-full -z-10" />

      {error && (
        <div className="glass-panel border-red-200/50 bg-red-50/30 text-red-700 px-6 py-4 rounded-2xl text-sm font-bold mb-8 animate-fade-in">
          {error}
        </div>
      )}

      {success && (
        <div className="glass-panel border-green-200/50 bg-green-50/30 text-green-700 px-6 py-4 rounded-2xl text-sm font-bold mb-8 animate-fade-in">
          {success}
        </div>
      )}

      <div className="card-prestige !p-0 overflow-hidden animate-fade-in">
        {/* Profile Header */}
        <div className="relative h-48 bg-msu-gradient">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="absolute top-6 right-8">
            {!editing ? (
              <div className="flex gap-3">
                <button
                  onClick={shareProfile}
                  className="btn-prestige !bg-white/20 !backdrop-blur-lg !border-white/30 hover:!bg-white/30 shadow-none !py-2 !px-4 !text-sm !text-white"
                >
                  {showCopied ? '✓ Copied!' : '↗ Share'}
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-prestige !bg-white/20 !backdrop-blur-lg !border-white/30 hover:!bg-white/30 shadow-none !py-2 !px-4 !text-sm !text-white"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      full_name: profile.full_name,
                      pronouns: profile.pronouns || '',
                      major: profile.major || '',
                      year: profile.year || '',
                      bio: profile.bio || '',
                      interests: profile.interests || [],
                      looking_for: profile.looking_for || [],
                      campus_area: profile.campus_area || '',
                    })
                    setAvatarPreview(profile.avatar_url)
                    setAvatarFile(null)
                  }}
                  className="btn-secondary-prestige !bg-black/20 !text-white !border-transparent !py-2 !px-4 !text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-prestige !bg-white !text-msu-green shadow-xl !py-2 !px-4 !text-sm font-black"
                >
                  {saving ? '...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-10 pb-12">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 mb-12">
            <div className="relative group">
              <div
                onClick={() => editing && fileInputRef.current?.click()}
                className={`w-40 h-40 rounded-full bg-white p-2 shadow-2xl transition-all duration-500 overflow-hidden ${editing ? 'cursor-pointer hover:scale-105' : ''
                  }`}
              >
                <div className="w-full h-full rounded-full bg-background-elevated overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">👤</span>
                  )}
                </div>
              </div>
              {editing && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-2 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white font-black text-xs uppercase tracking-widest">Update</span>
                </div>
              )}
              {editing && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              )}
            </div>

            <div className="flex-1 pb-2">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">{formData.full_name}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {formData.pronouns && (
                  <span className="text-xs font-black uppercase tracking-widest text-[#c084fc] bg-msu-accent/5 px-3 py-1 rounded-full">{formData.pronouns}</span>
                )}
                <span className="text-gray-400 font-bold">
                  {formData.major && formData.year
                    ? `${formData.major} • ${formData.year}`
                    : formData.major || formData.year || 'MSU Student'}
                </span>
                {formData.campus_area && (
                  <span className="text-xs font-bold text-msu-green-light px-3 py-1 bg-msu-green/5 rounded-full border border-msu-green/10">📍 {formData.campus_area}</span>
                )}
              </div>
            </div>
          </div>

          {/* Photo Gallery Section */}
          <div className="mb-12">
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">Photo Gallery</h3>
            <PhotoGallery
              photos={photos}
              avatarUrl={profile.avatar_url}
              isEditing={editing}
              onAddPhoto={() => galleryInputRef.current?.click()}
              onDeletePhoto={handleDeletePhoto}
            />
            {editing && (
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleGalleryPhotoSelect}
                className="hidden"
              />
            )}
            {uploadingPhoto && (
              <div className="mt-3 text-center text-sm text-gray-500 font-medium">
                Uploading photo...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-12">
              {!editing ? (
                /* View mode bits */
                <>
                  <section className="animate-fade-in reveal-delay-1">
                    <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">About the Spartan</h3>
                    <p className="text-lg text-gray-600 font-medium leading-relaxed italic">
                      {profile.bio ? `"${profile.bio}"` : "This spartan hasn't written their bio yet... too busy winning probably!"}
                    </p>
                  </section>

                  <section className="animate-fade-in reveal-delay-2">
                    <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">The Selection (Interests)</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <span key={interest} className="chip-prestige">{interest}</span>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                /* Edit mode fields */
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="input-prestige"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Pronouns</label>
                      <input
                        type="text"
                        value={formData.pronouns}
                        onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                        className="input-prestige"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Academic Year</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value as YearType })}
                        className="input-prestige"
                      >
                        <option value="">Select year</option>
                        {YEARS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Major</label>
                      <input
                        type="text"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        className="input-prestige"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Campus Residential Area</label>
                      <select
                        value={formData.campus_area}
                        onChange={(e) => setFormData({ ...formData, campus_area: e.target.value })}
                        className="input-prestige"
                      >
                        <option value="">Select area</option>
                        {CAMPUS_AREAS.map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Legacy (Bio)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="input-prestige min-h-[140px] resize-none"
                      maxLength={500}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-12">
              {!editing ? (
                <section className="animate-fade-in reveal-delay-3">
                  <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">Seeking Connection</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {profile.looking_for.map((item) => (
                      <div key={item} className="flex items-center gap-3 bg-msu-accent/5 p-4 rounded-2xl border border-msu-accent/10">
                        <span className="text-xl">🤝</span>
                        <span className="font-bold text-gray-700 text-sm tracking-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="space-y-10 animate-fade-in">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Vibe Selection</label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={formData.interests.includes(interest) ? 'chip-prestige chip-prestige-active' : 'chip-prestige'}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Looking For...</label>
                    <div className="flex flex-wrap gap-2">
                      {LOOKING_FOR.map((item) => (
                        <button
                          key={item}
                          onClick={() => toggleLookingFor(item)}
                          className={formData.looking_for.includes(item) ? 'chip-prestige chip-prestige-active' : 'chip-prestige'}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="mt-8 animate-fade-in">
        <button
          onClick={() => setShowDangerZone(!showDangerZone)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50/50 border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
        >
          <span className="font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Danger Zone
          </span>
          <svg className={`w-5 h-5 transition-transform ${showDangerZone ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDangerZone && (
          <div className="mt-4 p-6 rounded-2xl bg-red-50/30 border border-red-100 space-y-4 animate-fade-in">
            <p className="text-sm text-red-600 font-medium">
              These actions are permanent and cannot be undone. Please proceed with caution.
            </p>

            <div className="space-y-3">
              {/* Delete all posts */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Delete All Posts</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Remove all your feed posts permanently</p>
                </div>
                <button
                  onClick={deleteAllPosts}
                  disabled={deletingPosts}
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-600 text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  {deletingPosts ? 'Deleting...' : 'Delete Posts'}
                </button>
              </div>

              {/* Delete all photos */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Delete All Gallery Photos</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Remove all photos from your gallery</p>
                </div>
                <button
                  onClick={deleteAllPhotos}
                  disabled={deletingPhotos}
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-600 text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  {deletingPhotos ? 'Deleting...' : 'Delete Photos'}
                </button>
              </div>

              {/* Delete account */}
              <div className="flex items-center justify-between p-4 bg-red-100/50 rounded-xl border border-red-200">
                <div>
                  <h4 className="font-bold text-red-700 text-sm">Delete Account</h4>
                  <p className="text-xs text-red-600 mt-0.5">Permanently delete your entire account and all data</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-gray-900">Delete Your Account?</h2>
              <p className="text-sm text-gray-500 mt-2">
                This will permanently delete your profile, all posts, photos, messages, friendships, and all associated data. This action cannot be undone.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="input-prestige !border-red-200 focus:!border-red-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                }}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && rawImageSrc && (
        <ImageCropper
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
