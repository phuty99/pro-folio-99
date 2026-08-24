import { Link } from 'react-router-dom'
import type { Profile } from '../types'
import VoxelCube from './VoxelCube'

function splitTags(text: string): string[] {
  return (text || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export default function CvView({ profile }: { profile: Profile }) {
  const skills = splitTags(profile.skills)
  const interests = splitTags(profile.interests)
  const contactLinks = [
    profile.location && { label: profile.location, href: null },
    profile.phone && { label: profile.phone, href: `tel:${profile.phone}` },
    profile.website_url && { label: 'Website', href: profile.website_url },
    profile.linkedin_url && { label: 'LinkedIn', href: profile.linkedin_url },
    profile.github_url && { label: 'GitHub', href: profile.github_url },
  ].filter((link): link is { label: string; href: string | null } => Boolean(link))

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-[280px_1fr] gap-6 items-start">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-8 bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6 flex flex-col items-center text-center gap-4">
        <div className="relative">
          <img
            src={profile.avatar_url || 'https://placehold.co/128x128?text=?'}
            alt="Avatar"
            className="w-28 h-28 rounded-2xl object-cover border-2 border-earth-200"
          />
          <VoxelCube size={28} className="absolute -bottom-2 -right-2 drop-shadow" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-earth-900">{profile.full_name || 'Unnamed'}</h1>
          {profile.headline && <p className="text-earth-600 text-sm mt-1">{profile.headline}</p>}
        </div>

        {profile.cv_url && (
          <a
            href={profile.cv_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-fire-600 hover:bg-fire-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Download CV (PDF)
          </a>
        )}

        <Link
          to={`/u/${profile.id}/blog`}
          className="w-full bg-earth-100 hover:bg-earth-200 text-earth-800 text-sm font-medium px-4 py-2 rounded-lg"
        >
          Blog posts
        </Link>

        {contactLinks.length > 0 && (
          <div className="w-full border-t border-earth-200 pt-4 flex flex-col gap-2 text-sm text-earth-700 text-left">
            {contactLinks.map((link, i) =>
              link.href ? (
                <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-fire-600 font-medium truncate">
                  {link.label}
                </a>
              ) : (
                <span key={i} className="truncate">{link.label}</span>
              )
            )}
          </div>
        )}

        {skills.length > 0 && (
          <div className="w-full border-t border-earth-200 pt-4 text-left">
            <h2 className="text-xs font-semibold text-earth-500 uppercase tracking-wide mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <span key={i} className="bg-earth-50 text-earth-800 text-xs px-2.5 py-1 rounded-md border border-earth-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {interests.length > 0 && (
          <div className="w-full border-t border-earth-200 pt-4 text-left">
            <h2 className="text-xs font-semibold text-earth-500 uppercase tracking-wide mb-2">Interests</h2>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest, i) => (
                <span key={i} className="bg-fire-50 text-fire-700 text-xs px-2.5 py-1 rounded-md">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-col gap-6 min-w-0">
        {profile.bio && (
          <section className="bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6">
            <h2 className="text-sm font-semibold text-earth-500 uppercase tracking-wide mb-3">About</h2>
            <p className="text-earth-800 whitespace-pre-line leading-relaxed">{profile.bio}</p>
          </section>
        )}

        {profile.experiences.length > 0 && (
          <section className="bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6">
            <h2 className="text-sm font-semibold text-earth-500 uppercase tracking-wide mb-5">Experience</h2>
            <div className="flex flex-col">
              {profile.experiences.map((exp, i) => (
                <div key={i} className="relative pl-9 pb-7 last:pb-0 border-l-2 border-earth-300 last:border-transparent">
                  <VoxelCube size={22} className="absolute -left-[11px] top-0" />
                  <div className="flex flex-wrap justify-between gap-x-4 min-w-0">
                    <p className="font-medium text-earth-900 min-w-0">
                      {exp.title}
                      {exp.company && <span className="text-earth-600 font-normal"> · {exp.company}</span>}
                    </p>
                    {(exp.start_date || exp.end_date) && (
                      <p className="text-xs text-earth-500 whitespace-nowrap font-medium">
                        {exp.start_date}
                        {exp.start_date && exp.end_date ? ' – ' : ''}
                        {exp.end_date}
                      </p>
                    )}
                  </div>
                  {exp.description && <p className="text-earth-700 mt-1.5 text-sm whitespace-pre-line leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.educations.length > 0 && (
          <section className="bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6">
            <h2 className="text-sm font-semibold text-earth-500 uppercase tracking-wide mb-5">Education</h2>
            <div className="flex flex-col">
              {profile.educations.map((edu, i) => (
                <div key={i} className="relative pl-9 pb-7 last:pb-0 border-l-2 border-earth-300 last:border-transparent">
                  <VoxelCube size={22} className="absolute -left-[11px] top-0" />
                  <div className="flex flex-wrap justify-between gap-x-4 min-w-0">
                    <p className="font-medium text-earth-900 min-w-0">
                      {edu.school}
                      {edu.degree && <span className="text-earth-600 font-normal"> · {edu.degree}</span>}
                    </p>
                    {(edu.start_date || edu.end_date) && (
                      <p className="text-xs text-earth-500 whitespace-nowrap font-medium">
                        {edu.start_date}
                        {edu.start_date && edu.end_date ? ' – ' : ''}
                        {edu.end_date}
                      </p>
                    )}
                  </div>
                  {edu.description && <p className="text-earth-700 mt-1.5 text-sm whitespace-pre-line leading-relaxed">{edu.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.projects.length > 0 && (
          <section className="bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6">
            <h2 className="text-sm font-semibold text-earth-500 uppercase tracking-wide mb-5">Projects</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {profile.projects.map((proj) => {
                const tech = splitTags(proj.tech_stack)
                return (
                  <div key={proj.id} className="border border-earth-200 rounded-xl overflow-hidden flex flex-col">
                    {proj.thumbnail_url && (
                      <img src={proj.thumbnail_url} alt="" className="w-full h-36 object-cover" />
                    )}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <p className="font-medium text-earth-900">{proj.title}</p>
                      {proj.description && (
                        <p className="text-earth-700 text-sm whitespace-pre-line">{proj.description}</p>
                      )}
                      {tech.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {tech.map((t, i) => (
                            <span key={i} className="bg-earth-50 text-earth-800 text-xs px-2 py-0.5 rounded-md border border-earth-200">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4 mt-auto pt-2 text-sm">
                        {proj.demo_url && (
                          <a href={proj.demo_url} target="_blank" rel="noopener noreferrer" className="text-fire-600 hover:text-fire-700 font-medium">
                            Live demo
                          </a>
                        )}
                        {proj.github_url && (
                          <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-fire-600 hover:text-fire-700 font-medium">
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {profile.images.length > 0 && (
          <section className="bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6">
            <h2 className="text-sm font-semibold text-earth-500 uppercase tracking-wide mb-5">Gallery</h2>
            <div className="grid grid-cols-3 gap-3">
              {profile.images.map((img) => (
                <img key={img.id} src={img.url} alt="" className="w-full h-28 object-cover rounded-lg border border-earth-200" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
