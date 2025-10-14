"use client";

import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
          Radon Black Box Edition AI
        </h1>
        
        {/* Subtitle */}
        <h2 className="text-xl md:text-2xl lg:text-3xl text-white/80 mb-8 animate-fade-in animation-delay-200">
          Мета-когнитивная AI система нового поколения
        </h2>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-white/60 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in animation-delay-400">
          Не просто еще один LLM. Radon AI — это часть революционной AGI архитектуры, 
          состоящей из 18 специализированных модулей. Каждый модуль отвечает за свою область 
          когнитивных способностей, создавая систему, которая думает как человек, но превосходит 
          его в масштабе и скорости.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-600">
          <SignUpButton mode="modal">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl">
              Попробовать Beta
            </button>
          </SignUpButton>
          
          <button 
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 glass-panel glass-hover text-white font-semibold rounded-xl transition-all duration-200"
          >
            Записаться в Waitlist
          </button>
        </div>
        
        {/* Additional info */}
        <div className="mt-16 text-sm text-white/40 animate-fade-in animation-delay-800">
          <p>Официальный пилот с ВКонтакте • 7B параметров • 100K+ диалогов</p>
        </div>
      </div>
    </section>
  );
}
