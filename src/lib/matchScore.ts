import type { Profile } from '@/types/database'

interface MatchResult {
  score: number
  reasons: string[]
}

export function calculateMatchScore(
  currentUser: Profile,
  otherUser: Profile,
  sharedClasses?: string[]
): MatchResult {
  let score = 0
  const reasons: string[] = []

  // Shared interests: +8 per match, cap at 40
  const sharedInterests = currentUser.interests.filter((i) =>
    otherUser.interests.includes(i)
  )
  if (sharedInterests.length > 0) {
    const interestScore = Math.min(sharedInterests.length * 8, 40)
    score += interestScore
    if (sharedInterests.length <= 3) {
      reasons.push(`Shared interests: ${sharedInterests.join(', ')}`)
    } else {
      reasons.push(
        `${sharedInterests.length} shared interests including ${sharedInterests.slice(0, 2).join(', ')}`
      )
    }
  }

  // Same major: +15
  if (
    currentUser.major &&
    otherUser.major &&
    currentUser.major.toLowerCase() === otherUser.major.toLowerCase()
  ) {
    score += 15
    reasons.push(`Same major: ${otherUser.major}`)
  }

  // Same year: +10
  if (currentUser.year && otherUser.year && currentUser.year === otherUser.year) {
    score += 10
    reasons.push(`Same year: ${otherUser.year}`)
  }

  // Shared "looking for": +8 per match, cap at 16
  const sharedLookingFor = currentUser.looking_for.filter((l) =>
    otherUser.looking_for.includes(l)
  )
  if (sharedLookingFor.length > 0) {
    const lookingForScore = Math.min(sharedLookingFor.length * 8, 16)
    score += lookingForScore
    reasons.push(`Both looking for: ${sharedLookingFor.join(', ')}`)
  }

  // Same campus area: +5
  if (
    currentUser.campus_area &&
    otherUser.campus_area &&
    currentUser.campus_area === otherUser.campus_area
  ) {
    score += 5
    reasons.push(`Same area: ${otherUser.campus_area}`)
  }

  // Same dorm: +10
  if (
    currentUser.dorm &&
    otherUser.dorm &&
    currentUser.dorm === otherUser.dorm
  ) {
    score += 10
    reasons.push(`Same dorm: ${otherUser.dorm}`)
  }

  // Shared classes: +12 per class, cap at 24
  if (sharedClasses && sharedClasses.length > 0) {
    const classScore = Math.min(sharedClasses.length * 12, 24)
    score += classScore
    reasons.push(`${sharedClasses.length} shared class${sharedClasses.length > 1 ? 'es' : ''}`)
  }

  // Normalize to percentage (max: 40 + 15 + 10 + 16 + 5 + 10 + 24 = 120, cap at 100)
  const normalizedScore = Math.min(score, 100)

  return {
    score: normalizedScore,
    reasons,
  }
}

// Helper to calculate distance between two coordinates in miles
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
