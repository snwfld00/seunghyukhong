'use client'

import { motion } from 'framer-motion'
import { Briefcase, Award, Heart, FileText, BadgeCheck } from 'lucide-react'

const timeline = [
  {
    year: '2024 - Present',
    title: 'Undergraduate Researcher',
    organization: 'INU Visual Information Perception Lab, Incheon National University',
    description: 'Research on Object Detection, Vision-Language Models, and robust detection in adverse conditions.',
    type: 'work',
  },
  {
    year: '2023 - Present',
    title: 'B.S. in Computer Science',
    organization: 'Incheon National University',
    description: 'Department of Information Technology. Focus on Computer Vision and Deep Learning research.',
    type: 'education',
  },
]

const awards = [
  {
    year: '2024',
    title: 'Special Award',
    organization: '1st Hackathon: Luckython - INU College of Information Technology',
  },
]

const certifications = [
  {
    year: '2024',
    title: 'ADsP (Advanced Data Analytics Semi-Professional)',
    organization: 'Korea Data Agency',
  },
]

const publications = [
  {
    year: '2025',
    venue: 'KCC 2025',
    name: 'Korea Computer Congress',
  },
  {
    year: '2025',
    venue: 'KSC 2025',
    name: 'Korea Software Congress',
  },
  {
    year: '2024',
    venue: 'ACK 2024',
    name: 'Annual Conference of KIPS',
  },
]

const interests = [
  'Object Detection',
  'All-Day Robust Detection',
  'Vision-Language Models (VLM)',
  'Semi-Supervised Learning',
  'Adverse Weather Detection',
  'Night-time Detection',
  'Multi-modal Learning',
  'Deep Learning',
]

export default function AboutPage() {
  return (
    <div className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Me</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Undergraduate researcher focused on building robust object detection systems
            that work reliably in diverse and challenging conditions.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-6" />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-20"
          >
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hello! I&apos;m SeungHyuk Hong, an undergraduate researcher at INU Visual Information Perception Lab,
                Incheon National University, studying Computer Science with a focus on Computer Vision and Deep Learning.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                My primary research area is Object Detection, with particular interest in building
                robust detection systems that work reliably in adverse weather conditions and nighttime scenarios.
                I also explore Vision-Language Models and Semi-Supervised Learning to develop
                more efficient and generalizable detection methods.
              </p>
            </div>
          </motion.section>

          {/* Timeline */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-primary" />
              Experience & Education
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="relative pl-12"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-2 border-background ${
                      item.type === 'work' ? 'bg-primary' : 'bg-accent'
                    }`} />

                    <div className="p-6 rounded-xl border border-border bg-card">
                      <span className="text-sm text-muted-foreground">{item.year}</span>
                      <h3 className="text-lg font-semibold mt-1">{item.title}</h3>
                      <p className="text-primary text-sm mt-1">{item.organization}</p>
                      <p className="text-muted-foreground text-sm mt-2">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Publications */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              Publications
            </h2>
            <div className="grid gap-4">
              {publications.map((pub, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="p-4 rounded-xl border border-border bg-card flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{pub.venue}</h3>
                    <p className="text-sm text-muted-foreground">{pub.name}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{pub.year}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Awards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              Honors & Awards
            </h2>
            <div className="grid gap-4">
              {awards.map((award, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="p-4 rounded-xl border border-border bg-card flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{award.title}</h3>
                    <p className="text-sm text-muted-foreground">{award.organization}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{award.year}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Certifications */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <BadgeCheck className="w-6 h-6 text-primary" />
              Certifications
            </h2>
            <div className="grid gap-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="p-4 rounded-xl border border-border bg-card flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground">{cert.organization}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{cert.year}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Research Interests */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              Research Interests
            </h2>
            <div className="flex flex-wrap gap-3">
              {interests.map((interest, index) => (
                <motion.span
                  key={interest}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {interest}
                </motion.span>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
