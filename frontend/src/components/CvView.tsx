import { Link } from 'react-router-dom'
import { FiGithub, FiGlobe, FiLinkedin, FiMapPin, FiPhone } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import type { Profile } from '../types'
import VoxelCube from './VoxelCube'
import { getSkillIcon } from '../utils/skillIcons'

function splitTags(text: string): string[] {
  return (text || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function DescriptionBlock({ text }: { text: string }) {
  const lines = text.split('\n').filter((line) => line.trim())
  return (
    <div className="mt-1.5 flex flex-col gap-1">
      {lines.map((line, i) =>
        line.trim().startsWith('- ') ? (
          <p key={i} className="text-earth-900 font-semibold text-base leading-7">
            {line}
          </p>
        ) : (
          <p key={i} className={`text-earth-900 font-bold text-base leading-7 ${i > 0 ? 'mt-2' : ''}`}>
            {line}
          </p>
        )
      )}
    </div>
  )
}

function SkillPill({ skill }: { skill: string }) {
  const { Icon, color } = getSkillIcon(skill)
  return (
    <span className="inline-flex items-center gap-1.5 bg-earth-50 dark:bg-earth-200 text-earth-800 text-xs px-2.5 py-1.5 rounded-full border border-earth-200 dark:border-earth-300">
      {Icon && <Icon size={14} color={color} />}
      {skill}
    </span>
  )
}

export default function CvView({ profile }: { profile: Profile }) {
  const skills = splitTags(profile.skills)
  const interests = splitTags(profile.interests)
  const contactIcons: { Icon: IconType; label: string; href: string }[] = [
    profile.phone && { Icon: FiPhone, label: `Phone: ${profile.phone}`, href: `tel:${profile.phone}` },
    profile.website_url && { Icon: FiGlobe, label: 'Website', href: profile.website_url },
    profile.linkedin_url && { Icon: FiLinkedin, label: 'LinkedIn', href: profile.linkedin_url },
    profile.github_url && { Icon: FiGithub, label: 'GitHub', href: profile.github_url },
  ].filter((link): link is { Icon: IconType; label: string; href: string } => Boolean(link))

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-[280px_1fr] gap-6 items-start">
      {/* Sidebar */}
      <aside className="md:sticky md:top-8 bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6 flex flex-col items-center text-center gap-4">
        <div className="relative flex items-center justify-center w-28 h-28">
          <div className="absolute -left-3 -top-3 w-24 h-24 rounded-full bg-fire-100 dark:bg-fire-500/15" />
          <img
            src={profile.avatar_url || 'https://placehold.co/128x128?text=?'}
            alt="Avatar"
            className="relative w-28 h-28 rounded-full object-cover border-2 border-white dark:border-earth-100 shadow-md"
          />
          <VoxelCube size={26} className="absolute bottom-1.5 right-1.5 drop-shadow" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-earth-900 uppercase tracking-wide">{profile.full_name || 'Unnamed'}</h1>
          {profile.headline && <p className="text-earth-600 text-sm mt-1">{profile.headline}</p>}
        </div>

        {profile.location && (
          <p className="flex items-center gap-1.5 text-sm text-earth-600 -mt-2">
            <FiMapPin size={14} />
            {profile.location}
          </p>
        )}

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

        {contactIcons.length > 0 && (
          <div className="w-full border-t border-earth-200 pt-4 flex items-center justify-center gap-2.5">
            {contactIcons.map(({ Icon, label, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-earth-200 dark:border-earth-300 text-earth-600 hover:text-fire-600 hover:border-fire-400 transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div className="w-full border-t border-earth-200 pt-4 text-left">
            <h2 className="text-xl font-black text-earth-900 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <SkillPill key={i} skill={skill} />
              ))}
            </div>
          </div>
        )}

        {interests.length > 0 && (
          <div className="w-full border-t border-earth-200 pt-4 text-left">
            <h2 className="text-xl font-black text-earth-900 mb-2">Interests</h2>
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
            <h2 className="text-xl font-black text-earth-900 mb-3">About</h2>
            <div className="relative bg-fire-50 dark:bg-fire-500/10 border-l-4 border-fire-500 rounded-r-md pl-6 pr-4 py-4">
              <span className="absolute top-2 left-2 text-4xl leading-none text-fire-300 dark:text-fire-500/30 font-serif select-none">
                &ldquo;
              </span>
              <p className="relative text-earth-800 italic whitespace-pre-line leading-relaxed">{profile.bio}</p>
            </div>
          </section>
        )}

        {profile.experiences.length > 0 && (
          <section className="bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6">
            <h2 className="text-xl font-black text-earth-900 mb-5">Experience</h2>
            <div className="flex flex-col">
              {profile.experiences.map((exp, i) => (
                <div key={i} className="relative pl-9 pb-7 last:pb-0 border-l-2 border-earth-300 last:border-transparent">
                  <VoxelCube size={22} className="absolute -left-[11px] top-0" />
                  <div className="flex flex-wrap justify-between gap-x-4 min-w-0">
                    <h3 className="text-xl font-black text-earth-900 leading-tight min-w-0">
                      {exp.title}
                      {exp.company && <span className="text-earth-500 font-medium"> {exp.company}</span>}
                    </h3>
                    {(exp.start_date || exp.end_date) && (
                      <p className="text-sm font-extrabold text-earth-900 whitespace-nowrap shrink-0 text-right">
                        {exp.start_date}
                        {exp.start_date && exp.end_date ? ' – ' : ''}
                        {exp.end_date}
                      </p>
                    )}
                  </div>
                  {exp.description && <DescriptionBlock text={exp.description} />}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.educations.length > 0 && (
          <section className="bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6">
            <h2 className="text-xl font-black text-earth-900 mb-5">Education</h2>
            <div className="flex flex-col">
              {profile.educations.map((edu, i) => (
                <div key={i} className="relative pl-9 pb-7 last:pb-0 border-l-2 border-earth-300 last:border-transparent">
                  <VoxelCube size={22} className="absolute -left-[11px] top-0" />
                  <div className="flex flex-wrap justify-between gap-x-4 min-w-0">
                    <h3 className="text-xl font-black text-earth-900 leading-tight min-w-0">
                      {edu.school}
                      {edu.degree && <span className="text-earth-500 font-medium"> {edu.degree}</span>}
                    </h3>
                    {(edu.start_date || edu.end_date) && (
                      <p className="text-sm font-extrabold text-earth-900 whitespace-nowrap shrink-0 text-right">
                        {edu.start_date}
                        {edu.start_date && edu.end_date ? ' – ' : ''}
                        {edu.end_date}
                      </p>
                    )}
                  </div>
                  {edu.description && <DescriptionBlock text={edu.description} />}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.projects.length > 0 && (
          <section className="bg-white dark:bg-earth-100 rounded-2xl border border-earth-300 dark:border-earth-200 shadow-md p-6">
            <h2 className="text-xl font-black text-earth-900 mb-5">Projects</h2>
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
            <h2 className="text-xl font-black text-earth-900 mb-5">Gallery</h2>
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
