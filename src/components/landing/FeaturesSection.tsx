"use client";

import { Brain, Zap, Globe, Users, Target, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

const features = [
  {
    icon: Brain,
    key: "meta_cognitive"
  },
  {
    icon: Zap,
    key: "reasoning"
  },
  {
    icon: Globe,
    key: "multilingual"
  },
  {
    icon: Target,
    key: "parameters"
  },
  {
    icon: Users,
    key: "training"
  },
  {
    icon: Shield,
    key: "enterprise"
  }
];

export default function FeaturesSection() {
  const t = useTranslations('features');

  return (
    <section className="py-20 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  {t(`items.${feature.key}.title`)}
                </h3>
              </div>
              <p className="text-white/70 leading-relaxed">
                {t(`items.${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
