"use client";

import { Brain, Zap, Globe, Users, Target, Shield } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Meta-Cognitive Architecture",
    description: "Не один большой LLM, а система из 18 специализированных модулей, каждый из которых отвечает за свою область когнитивных способностей."
  },
  {
    icon: Zap,
    title: "Advanced Reasoning",
    description: "Улучшенная логика и рассуждение благодаря мета-когнитивному подходу. Система не просто генерирует текст, а думает."
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Полная поддержка русского и английского языков с пониманием культурных контекстов и нюансов."
  },
  {
    icon: Target,
    title: "7B Parameters",
    description: "Компактная, но мощная модель с 7 миллиардами параметров, оптимизированная для эффективности и качества."
  },
  {
    icon: Users,
    title: "100K+ Training Dialogues",
    description: "Высококачественные обучающие данные из более чем 100,000 диалогов для максимально естественного общения."
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "Готовность к корпоративному использованию с официальным пилотом и интеграцией с крупными платформами."
  }
];

const vkPilot = {
  title: "Официальный пилот с ВКонтакте",
  description: "Мы гордимся партнерством с ВКонтакте для тестирования Radon AI в реальных условиях. Это первый шаг к интеграции мета-когнитивной AI в крупнейшую социальную сеть России.",
  status: "В активной разработке"
};

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Технология будущего
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Radon AI представляет новое поколение искусственного интеллекта, 
            где каждый модуль специализируется на своей области, создавая 
            единую когнитивную систему.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-panel rounded-2xl p-6 glass-hover animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 glass-panel-strong rounded-xl flex items-center justify-center mr-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-white/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* VK Pilot section */}
        <div className="glass-panel-strong rounded-3xl p-8 md:p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 glass-panel rounded-full mb-6">
              <span className="text-sm font-medium text-white/80">
                {vkPilot.status}
              </span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {vkPilot.title}
            </h3>
            
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              {vkPilot.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="glass-panel rounded-xl p-4 flex-1 max-w-xs">
                <div className="text-2xl font-bold text-white mb-1">1</div>
                <div className="text-sm text-white/60">Официальный партнер</div>
              </div>
              <div className="glass-panel rounded-xl p-4 flex-1 max-w-xs">
                <div className="text-2xl font-bold text-white mb-1">18</div>
                <div className="text-sm text-white/60">Специализированных модулей</div>
              </div>
              <div className="glass-panel rounded-xl p-4 flex-1 max-w-xs">
                <div className="text-2xl font-bold text-white mb-1">2026-2027</div>
                <div className="text-sm text-white/60">Планируемые тесты</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
