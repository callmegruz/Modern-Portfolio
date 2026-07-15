import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Github,
  ExternalLink,
  Send,
  Sparkles,
  Mail,
  Linkedin,
  Brain,
  Eye,
  MessageSquare,
  Network,
  GraduationCap,
  Database,
  Cloud,
  Code,
  Server,
  Menu,
  X,
  Copy,
  Check,
  Sun,
  Moon
} from 'lucide-react'
import Canvas3D from './components/Canvas3D'
import ProjectCanvas3D from './components/ProjectCanvas'

// Animation presets
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
}

const sectionReveal = {
  initial: { opacity: 0, scale: 0.95, y: 60 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const }
}

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  },
  viewport: { once: true, margin: '-100px' }
}

const tiltProps = {
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const xc = rect.width / 2
    const yc = rect.height / 2
    const dx = (x - xc) / xc
    const dy = (y - yc) / yc
    card.style.setProperty('--rx', `${dy * -12}deg`)
    card.style.setProperty('--ry', `${dx * 12}deg`)
  },
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--tz', '15px')
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
    card.style.setProperty('--tz', '0px')
  }
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Contact Form State
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' })
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('charansuriya2000@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      // Section tracking
      const sections = ['hero', 'about', 'projects', 'experience', 'education', 'contact']
      const scrollPosition = window.scrollY + window.innerHeight / 3

      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name || !formState.email || !formState.message) {
      setFormStatus('error')
      return
    }

    setFormStatus('submitting')

    try {
      const devKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
      const isDev = import.meta.env.DEV

      if (isDev && devKey && devKey !== "YOUR_ACCESS_KEY_HERE" && devKey.trim() !== "") {
        // Direct submission for local development convenience
        const payload = {
          access_key: devKey,
          name: formState.name,
          email: formState.email,
          subject: formState.subject || "New Message from Portfolio",
          message: formState.message,
          from_name: "Guru's Portfolio (Local Dev)"
        }

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (response.ok && data.success) {
          setFormStatus('success')
          setFormState({ name: '', email: '', subject: '', message: '' })
        } else {
          setFormStatus('error')
        }
      } else {
        // Production: Submit securely through Vercel Serverless Function proxy
        const response = await fetch("/api/submit-contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: formState.name,
            email: formState.email,
            subject: formState.subject || "New Message from Portfolio",
            message: formState.message
          })
        })

        if (response.ok) {
          setFormStatus('success')
          setFormState({ name: '', email: '', subject: '', message: '' })
        } else {
          // Fallback to FormSubmit.co if the serverless proxy is misconfigured/fails
          const formData = new FormData()
          formData.append('name', formState.name)
          formData.append('email', formState.email)
          formData.append('subject', formState.subject || "New Message from Portfolio")
          formData.append('message', formState.message)

          const fallbackResponse = await fetch("https://formsubmit.co/ajax/charansuriya2000@gmail.com", {
            method: "POST",
            body: formData,
            headers: { 
              "Accept": "application/json"
            }
          })

          if (fallbackResponse.ok) {
            setFormStatus('success')
            setFormState({ name: '', email: '', subject: '', message: '' })
          } else {
            setFormStatus('error')
          }
        }
      }
    } catch {
      setFormStatus('error')
    }
  }

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // header height
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const skills = [
    { name: 'Machine Learning', icon: <Brain size={24} /> },
    { name: 'Computer Vision (OpenCV)', icon: <Eye size={24} /> },
    { name: 'Large Language Models', icon: <MessageSquare size={24} /> },
    { name: 'LangChain & RAG', icon: <Network size={24} /> },
    { name: 'Data Engineering (PySpark)', icon: <Server size={24} /> },
    { name: 'Cloud AI (GCP & BigQuery)', icon: <Cloud size={24} /> },
    { name: 'Database (SQL, PSQL)', icon: <Database size={24} /> },
    { name: 'Fullstack Development', icon: <Code size={24} /> }
  ]

  const projects = [
    {
      title: 'Personal RAG Bot',
      tags: ['Llama 3.2', 'DeepSeek-R1', 'ChromaDB', 'Flask'],
      desc: 'Privacy-first knowledge engine utilizing local LLMs and dense semantic vector search.',
      type: 'rag' as const,
      github: 'https://github.com/callmegruz',
      demo: '#'
    },
    {
      title: 'HireMate AI Job Assistant',
      tags: ['spaCy', 'ComplementNB', 'Streamlit', 'Python'],
      desc: 'NLP-driven recruitment matching assistant equipped with Streamlit chatbot interface.',
      type: 'hiremate' as const,
      github: 'https://github.com/callmegruz',
      demo: '#'
    }
  ]

  const experiences = [
    {
      date: 'Sep 2023 — Present',
      role: 'Senior AI / ML Developer',
      company: 'TANSAM',
      desc: 'Delivering high-end AI solutions and architectures, and mentoring students and faculties through skill-up programs and advanced internships.'
    },
    {
      date: 'June 2022 — Sep 2023',
      role: 'Programmer Analyst',
      company: 'Cognizant',
      desc: 'Developed Random Forests and XGBoost forecasting models. Automated PySpark preprocessing pipelines, reducing data cleaning time by 40%.'
    },
    {
      date: 'Jan 2022 — May 2022',
      role: 'Programmer Analyst Trainee',
      company: 'Cognizant',
      desc: 'Engineered a sales forecasting Linear Regression model and optimized SQL queries, reducing data retrieval latency by 25%.'
    }
  ]

  const education = [
    {
      date: 'Sep 2024 — Jan 2026',
      degree: 'MSc in Advanced Software Engineering',
      school: 'University of Leicester',
      location: 'Leicester, UK'
    },
    {
      date: 'Aug 2023 — July 2024',
      degree: 'Post Graduate Program in Data Science',
      school: 'VIT Bangalore',
      location: 'Karnataka, India'
    },
    {
      date: 'Aug 2018 — May 2022',
      degree: 'B.E. in Computer Science and Engineering',
      school: "St Joseph's College of Engineering (Anna University)",
      location: 'Chennai, India'
    }
  ]

  return (
    <div className="app-container">
      {/* Background Ambients */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Header / Nav */}
      <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#hero" onClick={(e) => { e.preventDefault(); handleNavClick('hero') }} className="logo-text">
            <Sparkles size={20} className="glow-icon" />
            <span>GURU.AI</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Desktop Nav */}
            <ul className="nav-links" style={{ alignItems: 'center' }}>
              {['hero', 'about', 'projects', 'experience', 'education', 'contact'].map((sec) => (
                <li key={sec}>
                  <a
                    href={`#${sec}`}
                    onClick={(e) => { e.preventDefault(); handleNavClick(sec) }}
                    className={`nav-link ${activeSection === sec ? 'active' : ''} ${sec === 'contact' ? 'nav-contact-highlight' : ''}`}
                  >
                    {sec.charAt(0).toUpperCase() + sec.slice(1)}
                  </a>
                </li>
              ))}
            </ul>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-toggle-btn"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-nav-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '80px', // Header height
              left: 0,
              width: '100%',
              background: 'rgba(3, 3, 12, 0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border-glass)',
              zIndex: 99,
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            {['hero', 'about', 'projects', 'experience', 'education', 'contact'].map((sec) => {
              const isContact = sec === 'contact';
              return (
                <a
                  key={sec}
                  href={`#${sec}`}
                  onClick={(e) => { e.preventDefault(); handleNavClick(sec) }}
                  className={isContact ? 'cta-btn' : ''}
                  style={isContact ? {
                    textAlign: 'center',
                    marginTop: '1rem',
                    display: 'block'
                  } : {
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: activeSection === sec ? 'var(--secondary)' : 'var(--text-muted)'
                  }}
                >
                  {sec.charAt(0).toUpperCase() + sec.slice(1)}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <motion.div
          className="hero-canvas-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <Canvas3D />
        </motion.div>

        <div className="container hero-wrapper" style={{ position: 'relative', zIndex: 5 }}>
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <span className="hero-subtitle">SENIOR AI / ML DEVELOPER</span>
            <h1 className="hero-title">
              Hi, I'm <span>Gurucharan</span>.
            </h1>
            <p className="hero-description">
              Specializing in delivering high-end AI solutions, intelligent chatbots, and enterprise-grade LLM architectures that drive innovation.
            </p>
            <div className="hero-buttons">
              <button onClick={() => handleNavClick('projects')} className="cta-btn">
                View Projects <ArrowRight size={16} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              </button>
              <button onClick={() => handleNavClick('contact')} className="btn-secondary">
                Get in Touch
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <motion.section id="about" className="section container" {...sectionReveal}>
        <motion.h2 className="section-title" {...fadeInUp}>About Me</motion.h2>
        <div className="about-grid">
          <motion.div className="about-bio" {...fadeInUp}>
            <div className="glass-card tilt-card" {...tiltProps} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p>
                I am a results-driven Senior AI/ML Developer focused on architecting high-end AI solutions, custom conversational chatbots, and robust LLM applications.
              </p>
              <p>
                With expertise in PySpark, OpenCV, and Google Cloud Platform, I translate complex data requirements into production-ready intelligence and scalable automated workflows.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--secondary)' }}>3+</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: 600 }}>Years Exp</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>5+</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: 600 }}>Projects Shipped</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="skills-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-100px' }}
          >
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
              >
                <div className="skill-tag tilt-card" {...tiltProps}>
                  <div className="skill-icon-wrapper">{skill.icon}</div>
                  <span className="skill-name">{skill.name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Projects Section */}
      <motion.section id="projects" className="section container" {...sectionReveal}>
        <motion.h2 className="section-title" {...fadeInUp}>Featured Projects</motion.h2>
        <motion.div
            className="projects-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-100px' }}
        >
          {projects.map((proj, idx) => (
            <motion.div
              key={idx}
              variants={{
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className="project-card glass-card tilt-card" {...tiltProps}>
                <div className="project-img-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                  <ProjectCanvas3D type={proj.type} />
                </div>
                <div className="project-info">
                  <div className="project-tags">
                    {proj.tags.map((t) => (
                      <span key={t} className="project-tag">{t}</span>
                    ))}
                  </div>
                  <h3 className="project-title">{proj.title}</h3>
                  <p className="project-desc">{proj.desc}</p>
                  <div className="project-links">
                    <a href={proj.github} className="project-link">
                      <Github size={16} /> Code
                    </a>
                    <a href={proj.demo} className="project-link">
                      <ExternalLink size={16} /> Live Demo
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Experience Section */}
      <motion.section id="experience" className="section container" {...sectionReveal}>
        <motion.h2 className="section-title" {...fadeInUp}>Career Journey</motion.h2>
        <div className="timeline">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              className="timeline-item"
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <div className="timeline-dot"></div>
              <div className="timeline-content tilt-card" {...tiltProps}>
                <span className="timeline-date">{exp.date}</span>
                <h3 className="timeline-role">{exp.role}</h3>
                <div className="timeline-company">{exp.company}</div>
                <p className="timeline-desc">{exp.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Education Section */}
      <motion.section id="education" className="section container" {...sectionReveal}>
        <motion.h2 className="section-title" {...fadeInUp}>Education</motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {education.map((edu, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{ display: 'flex' }}
            >
              <div 
                className="glass-card tilt-card" 
                {...tiltProps}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ color: 'var(--secondary)' }}>
                    <GraduationCap size={32} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}>
                      {edu.date}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: '0.25rem' }}>{edu.degree}</h3>
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{edu.school}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginTop: '0.1rem' }}>{edu.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section id="contact" className="section container" {...sectionReveal}>
        <div className="contact-grid-layout">
          {/* Left Column: Direct Info & Socials */}
          <div className="contact-info-panel glass-card tilt-card" {...tiltProps}>
            <div className="contact-info-header">
              <Mail size={36} style={{ color: 'var(--secondary)', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Let's Connect</h2>
              <p>Have an interesting project, job opening, or just want to chat? Reach out directly or drop a message via the form.</p>
            </div>

            <div className="contact-details">
              <div className="contact-detail-card tilt-card" {...tiltProps}>
                <span className="detail-label">Email Address</span>
                <span className="detail-value">charansuriya2000@gmail.com</span>
                <div className="detail-actions">
                  <button onClick={copyEmailToClipboard} className="btn-detail-action" aria-label="Copy email address">
                    {copied ? (
                      <>
                        <Check size={16} style={{ color: '#10b981' }} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy Email
                      </>
                    )}
                  </button>
                  <a href="mailto:charansuriya2000@gmail.com" className="btn-detail-action btn-cta-secondary" aria-label="Send direct email">
                    <Send size={16} /> Open Mail Client
                  </a>
                </div>
              </div>

              <div className="contact-detail-card tilt-card" {...tiltProps}>
                <span className="detail-label">Professional Networks</span>
                <div className="social-links-grid">
                  <a href="https://linkedin.com/in/gurucharan-s" target="_blank" rel="noreferrer" className="social-action-card tilt-card" id="contact-linkedin" {...tiltProps}>
                    <Linkedin size={20} />
                    <span>LinkedIn</span>
                  </a>
                  <a href="https://github.com/callmegruz" target="_blank" rel="noreferrer" className="social-action-card tilt-card" id="contact-github" {...tiltProps}>
                    <Github size={20} />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>

              <div className="contact-detail-card response-promise-card tilt-card" {...tiltProps}>
                <div className="promise-badge">
                  <Sparkles size={14} />
                  <span>Availability & Reply</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Always open to freelance work and career opportunities. I promise a response within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-panel glass-card tilt-card" {...tiltProps}>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Send a Message</h3>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Your Name</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  disabled={formStatus === 'submitting'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  disabled={formStatus === 'submitting'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input
                  id="subject"
                  type="text"
                  className="form-input"
                  placeholder="Project Discussion"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  disabled={formStatus === 'submitting'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  id="message"
                  className="form-textarea"
                  placeholder="Tell me about your project details..."
                  required
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  disabled={formStatus === 'submitting'}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={formStatus === 'submitting'}
              >
                {formStatus === 'submitting' ? (
                  <span>Sending Message...</span>
                ) : formStatus === 'success' ? (
                  <span>Sent Successfully!</span>
                ) : (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
              </button>

              <AnimatePresence>
                {formStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ color: '#10b981', textAlign: 'center', fontSize: '0.95rem', fontWeight: 600 }}
                  >
                    Thank you! Your message was received and I will reply shortly.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <p style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} Gurucharan Surianarayanan. All rights reserved.
          </p>
          <div className="footer-socials">
            <a href="https://github.com/callmegruz" target="_blank" rel="noreferrer" className="footer-social-link"><Github size={20} /></a>
            <a href="https://linkedin.com/in/gurucharan-s" target="_blank" rel="noreferrer" className="footer-social-link"><Linkedin size={20} /></a>
            <a href="mailto:charansuriya2000@gmail.com" className="footer-social-link"><Mail size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
