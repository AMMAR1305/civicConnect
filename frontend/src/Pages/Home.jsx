import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle, Shield, Upload, Clock, AlertTriangle, 
  UserCog, BarChart3, Key, Users, FileText, MapPin, Zap, 
  Globe, Smartphone, Brain, Bell, Moon, Sun, Star, Award,
  Code, Database, Cpu, Layers, Lock, Activity, TrendingUp, Menu, X
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Check for existing auth token
    const token = localStorage.getItem('token');
    if (token) {
      // Redirect based on role if already logged in
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.Role?.toLowerCase();
        if (role === 'admin') navigate('/admin');
        else if (role === 'officer') navigate('/officer');
        else navigate('/citizen');
      } catch (e) {
        localStorage.clear();
      }
    }
  }, [navigate]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: FileText,
      title: "Citizen Complaint Management",
      description: "Secure digital platform for citizens to submit municipal service requests with comprehensive documentation and tracking."
    },
    {
      icon: Upload,
      title: "Evidence Documentation System", 
      description: "Upload photographic evidence and automatically capture GPS coordinates for precise location-based service delivery."
    },
    {
      icon: Clock,
      title: "Service Level Agreement Monitoring",
      description: "Government-standard SLA tracking with automated escalation protocols ensuring timely resolution of citizen requests."
    },
    {
      icon: AlertTriangle,
      title: "Priority Escalation Framework",
      description: "Multi-tier escalation system that automatically prioritizes urgent municipal issues and notifies department heads."
    },
    {
      icon: UserCog,
      title: "Municipal Officer Dashboard",
      description: "Dedicated administrative interface for government officers to manage assigned cases and provide status updates."
    },
    {
      icon: BarChart3,
      title: "Executive Analytics Portal",
      description: "Comprehensive reporting and analytics dashboard for municipal administrators to monitor departmental performance."
    },
    {
      icon: Key,
      title: "Government Security Standards",
      description: "Multi-factor authentication with role-based access control meeting federal cybersecurity requirements."
    },
    {
      icon: Shield,
      title: "Citizen Data Protection",
      description: "End-to-end encryption and privacy safeguards compliant with government data protection regulations."
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Citizen Service Request",
      description: "Citizens submit official service requests through the government portal with digital signatures and supporting documentation.",
      icon: Users
    },
    {
      step: "02", 
      title: "Automated Case Assignment",
      description: "Government AI system automatically routes requests to appropriate municipal departments based on jurisdiction and expertise.",
      icon: Cpu
    },
    {
      step: "03",
      title: "Official Status Updates", 
      description: "Assigned government officers provide regular status updates through the secure administrative dashboard with audit trails.",
      icon: UserCog
    },
    {
      step: "04",
      title: "Executive Performance Review",
      description: "Municipal executives monitor SLA compliance, departmental performance, and generate official government reports.",
      icon: BarChart3
    }
  ];

  const techStack = [
    { name: "React.js", icon: Code, color: "text-blue-900" },
    { name: "Node.js", icon: Cpu, color: "text-green-700" },
    { name: "Express.js", icon: Layers, color: "text-slate-700" },
    { name: "MongoDB", icon: Database, color: "text-green-800" },
    { name: "JWT Security", icon: Key, color: "text-indigo-800" },
    { name: "Gov Standards", icon: Globe, color: "text-blue-800" }
  ];

  const securityFeatures = [
    { title: "Government Authentication", description: "Multi-factor authentication system meeting GOI cybersecurity standards", icon: Key },
    { title: "Administrative Access Control", description: "Hierarchical permissions system for government departments and roles", icon: Shield },
    { title: "Classified Data Encryption", description: "Military-grade encryption for all citizen and government data at rest", icon: Lock },
    { title: "Compliance Monitoring", description: "Automated audit trails and compliance reporting for transparency", icon: Activity }
  ];

  const futureEnhancements = [
    { title: "Real-time Gov Alerts", icon: Bell, color: "bg-blue-700" },
    { title: "Smart City Integration", icon: MapPin, color: "bg-green-700" },
    { title: "AI Governance Assistant", icon: Brain, color: "bg-indigo-700" },
    { title: "Mobile Gov App", icon: Smartphone, color: "bg-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800">
      {/* Enhanced Government Background Animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Government Symbols */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-blue-900 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-indigo-900 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-28 h-28 bg-navy-900 rounded-full animate-pulse animation-delay-4000"></div>
        </div>
        
        {/* Geometric Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
            {Array.from({ length: 96 }).map((_, i) => (
              <div
                key={i}
                className="border border-slate-300 opacity-30"
                style={{
                  animationDelay: `${(i % 12) * 0.1}s`,
                  animation: 'pulseGrid 4s ease-in-out infinite'
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating Civic Icons */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-16 left-20 animate-float-slow">
            <Shield className="w-12 h-12 text-blue-800" />
          </div>
          <div className="absolute top-32 right-32 animate-float-slow animation-delay-1000">
            <FileText className="w-10 h-10 text-indigo-700" />
          </div>
          <div className="absolute top-80 left-1/3 animate-float-slow animation-delay-2000">
            <MapPin className="w-14 h-14 text-slate-700" />
          </div>
          <div className="absolute bottom-40 right-20 animate-float-slow animation-delay-3000">
            <Users className="w-11 h-11 text-blue-900" />
          </div>
          <div className="absolute bottom-80 left-16 animate-float-slow animation-delay-4000">
            <BarChart3 className="w-13 h-13 text-indigo-800" />
          </div>
        </div>

        {/* Dynamic Connecting Lines */}
        <div className="absolute inset-0 opacity-8">
          <svg className="w-full h-full animate-pulse">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#3730a3" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M 50 100 Q 200 50 350 150 T 650 100"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-draw-line"
            />
            <path
              d="M 100 300 Q 300 200 500 350 T 800 200"
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              fill="none"
              className="animate-draw-line animation-delay-2000"
            />
          </svg>
        </div>

        {/* Particle Effect */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-600 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Government Seal Animation */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
          <div className="w-96 h-96 border-8 border-slate-400 rounded-full animate-spin-slow">
            <div className="w-full h-full border-4 border-dashed border-blue-400 rounded-full animate-spin-reverse">
              <div className="w-full h-full flex items-center justify-center">
                <Shield className="w-32 h-32 text-slate-600 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Government Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900 border-b-4 border-yellow-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Government Branding */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-yellow-500 p-2 rounded-lg mr-3">
                  <Shield className="w-8 h-8 text-slate-900" />
                </div>
                <div>
                  <div className="font-bold text-xl text-white">UrbanResolve</div>
                  <div className="text-xs text-yellow-400 uppercase tracking-widest">Government of India</div>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-yellow-500 transition-colors font-medium uppercase text-sm tracking-wide">Services</button>
              <button onClick={() => scrollToSection('workflow')} className="text-gray-300 hover:text-yellow-500 transition-colors font-medium uppercase text-sm tracking-wide">Process</button>
              <button onClick={() => scrollToSection('tech')} className="text-gray-300 hover:text-yellow-500 transition-colors font-medium uppercase text-sm tracking-wide">Technology</button>
              <button onClick={() => scrollToSection('security')} className="text-gray-300 hover:text-yellow-500 transition-colors font-medium uppercase text-sm tracking-wide">Security</button>
            </div>
            
            {/* Mobile Menu Button & Login */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors"
              >
              Login
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white hover:text-yellow-500 p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-slate-800 border-t border-slate-700">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button onClick={() => {scrollToSection('features'); setMobileMenuOpen(false);}} className="text-gray-300 hover:text-yellow-500 block px-3 py-2 font-medium uppercase text-sm tracking-wide">Services</button>
                <button onClick={() => {scrollToSection('workflow'); setMobileMenuOpen(false);}} className="text-gray-300 hover:text-yellow-500 block px-3 py-2 font-medium uppercase text-sm tracking-wide">Process</button>
                <button onClick={() => {scrollToSection('tech'); setMobileMenuOpen(false);}} className="text-gray-300 hover:text-yellow-500 block px-3 py-2 font-medium uppercase text-sm tracking-wide">Technology</button>
                <button onClick={() => {scrollToSection('security'); setMobileMenuOpen(false);}} className="text-gray-300 hover:text-yellow-500 block px-3 py-2 font-medium uppercase text-sm tracking-wide">Security</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Government Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className={`max-w-7xl mx-auto text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Government Header */}
          <div className="mb-8">
            <div className="inline-flex items-center bg-yellow-500 text-slate-900 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Official Government Portal
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-slate-900 block mb-2">Government of India</span>
            <span className="bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 bg-clip-text text-transparent">
              Municipal Services Portal
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-blue-900 font-bold mb-6 uppercase tracking-wide">
            Digital India Initiative for Transparent Governance
          </p>
          
          <p className="text-base sm:text-lg mb-8 max-w-4xl mx-auto leading-relaxed text-slate-600">
            An integrated government platform for citizen service delivery featuring real-time complaint management, 
            SLA-based accountability frameworks, and transparent municipal governance in accordance with Digital India guidelines.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-bold text-base uppercase tracking-wide flex items-center gap-2 transform hover:scale-105 transition-all duration-300 shadow-lg border-2 border-blue-900"
            >
              Citizen Services <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-white hover:bg-gray-50 text-blue-900 border-2 border-blue-900 px-8 py-4 rounded-lg font-bold text-base uppercase tracking-wide transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              New Registration
            </button>
          </div>
          
          {/* Government Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {[
              { number: "100%", label: "Digital Compliance" },
              { number: "24x7", label: "Government Services" },
              { number: "50K+", label: "Citizens Served" },
              { number: "10+", label: "Municipal Departments" }
            ].map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-110 transition-all duration-300 bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-slate-200">
                <div className="text-xl sm:text-3xl font-bold text-blue-900 mb-2">{stat.number}</div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Mission Section */}
      <section className="py-16 sm:py-20 bg-white border-t-4 border-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-slate-900 uppercase tracking-wide">Government Mission</h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto text-slate-600">
              Empowering citizens through transparent, accountable, and efficient municipal service delivery 
              in alignment with Digital India and Good Governance principles.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Transparent Governance",
                description: "Real-time service tracking and public dashboards ensure complete transparency in government operations and citizen service delivery."
              },
              {
                icon: Award,
                title: "Government Accountability",
                description: "SLA-based performance metrics and audit trails hold municipal departments accountable for timely and quality service delivery."
              },
              {
                icon: Star,
                title: "Digital Service Excellence", 
                description: "Streamlined digital processes and AI-powered assignment mechanisms deliver world-class government services to citizens."
              }
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 sm:p-8 rounded-lg shadow-lg text-center transform hover:scale-105 transition-all duration-300 border-2 border-slate-200">
                <div className="bg-blue-900 p-3 rounded-full w-fit mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-slate-900 uppercase tracking-wide">{item.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Services Section */}
      <section id="features" className="py-16 sm:py-20 bg-gradient-to-br from-slate-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-slate-900 uppercase tracking-wide">Digital Government Services</h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto text-slate-600">
              Comprehensive e-government services designed to deliver transparent, efficient, and citizen-centric municipal governance.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-l-4 border-blue-900"
              >
                <div className="bg-blue-900 p-2 rounded-lg w-fit mb-4">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                </div>
                <h3 className="text-sm sm:text-lg font-bold mb-3 text-slate-900 uppercase tracking-wide leading-tight">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Process Section */}
      <section id="workflow" className="py-16 sm:py-20 bg-white border-t-4 border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-slate-900 uppercase tracking-wide">Government Service Process</h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto text-slate-600">
              A streamlined four-step government process ensuring efficient service delivery and complete transparency.
            </p>
          </div>
          
          <div className="space-y-8 sm:space-y-16">
            {workflowSteps.map((step, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-6 sm:gap-12`}>
                <div className="w-full lg:w-1/2">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 sm:p-8 rounded-lg shadow-lg border-2 border-slate-200">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="bg-blue-900 text-yellow-500 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-base sm:text-lg mr-4 border-2 border-yellow-500">
                        {step.step}
                      </div>
                      <h3 className="text-lg sm:text-2xl font-bold text-slate-900 uppercase tracking-wide">{step.title}</h3>
                    </div>
                    <p className="text-sm sm:text-lg text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="bg-gradient-to-br from-blue-900 to-indigo-800 p-6 sm:p-8 rounded-full shadow-lg border-4 border-yellow-500">
                    <step.icon className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Technology Section */}
      <section id="tech" className="py-16 sm:py-20 bg-gradient-to-br from-slate-100 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-slate-900 uppercase tracking-wide">Government Technology Stack</h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto text-slate-600">
              Secure, scalable, and certified technologies meeting government cybersecurity and compliance standards.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {techStack.map((tech, index) => (
              <div 
                key={index}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center transform hover:scale-110 transition-all duration-300 border-2 border-slate-200 hover:border-blue-900"
              >
                <tech.icon className={`w-8 h-8 sm:w-12 sm:h-12 ${tech.color} mx-auto mb-2 sm:mb-3`} />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wide">{tech.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Security Section */}
      <section id="security" className="py-16 sm:py-20 bg-white border-t-4 border-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-slate-900 uppercase tracking-wide">Government Security Standards</h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto text-slate-600">
              Military-grade security infrastructure compliant with Government of India cybersecurity frameworks and data protection laws.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {securityFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-slate-50 to-green-50 p-4 sm:p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-all duration-300 border-l-4 border-green-600"
              >
                <div className="bg-green-600 p-2 rounded-lg w-fit mx-auto mb-4">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-sm sm:text-lg font-bold mb-3 text-slate-900 uppercase tracking-wide">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Initiatives Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-slate-900 uppercase tracking-wide">Future Government Initiatives</h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto text-slate-600">
              Upcoming digital transformation initiatives aligned with Smart Cities Mission and Digital India 2.0.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {futureEnhancements.map((enhancement, index) => (
              <div 
                key={index}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-all duration-300 border-2 border-slate-200"
              >
                <div className={`${enhancement.color} p-3 rounded-full w-fit mx-auto mb-4 border-2 border-white shadow-lg`}>
                  <enhancement.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-slate-900 uppercase tracking-wide">{enhancement.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Action Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center bg-yellow-500 text-slate-900 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Join Digital India
            </div>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6 uppercase tracking-wide">
            Transform Municipal Governance Today
          </h2>
          <p className="text-base sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Be part of India's digital transformation. Register for transparent, efficient, and accountable government services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="bg-yellow-500 text-slate-900 px-6 sm:px-8 py-4 rounded-lg font-bold text-base uppercase tracking-wide hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
               Registration
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="border-2 border-yellow-500 text-yellow-500 px-6 sm:px-8 py-4 rounded-lg font-bold text-base uppercase tracking-wide hover:bg-yellow-500 hover:text-slate-900 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
               Login
            </button>
          </div>
        </div>
      </section>

      {/* Government Footer */}
      <footer className="py-12 bg-slate-900 text-white border-t-4 border-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex flex-col sm:flex-row items-center mb-6 lg:mb-0">
              <div className="bg-yellow-500 p-3 rounded-lg mr-4 mb-4 sm:mb-0">
                <Shield className="w-8 h-8 text-slate-900" />
              </div>
              <div className="text-center sm:text-left">
                <div className="font-bold text-xl uppercase tracking-wide">Government of India</div>
                <div className="text-yellow-400 text-sm uppercase tracking-widest">UrbanResolve</div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="text-gray-300 mb-2 text-sm uppercase tracking-wide">© 2026 Digital India Initiative</div>
              <div className="text-gray-300 text-sm">Serving the Nation with Technology</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Government Animation Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        html {
          scroll-behavior: smooth;
        }
        
        /* Mobile Optimizations */
        @media (max-width: 640px) {
          .text-responsive {
            font-size: 0.875rem;
            line-height: 1.25rem;
          }
          .heading-responsive {
            font-size: 1.5rem;
            line-height: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;