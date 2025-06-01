'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'available' | 'coming_soon';
  logoPath: string;
  category: 'monitoring' | 'logging' | 'apm' | 'infrastructure' | 'security';
  features: string[];
}

const integrations: Integration[] = [
  {
    id: 'datadog',
    name: 'Datadog',
    description: 'Full-stack observability platform with metrics, logs, and APM',
    status: 'connected',
    logoPath: '/images/logos/datadog.png',
    category: 'monitoring',
    features: ['Metrics', 'Logs', 'APM', 'Infrastructure', 'Dashboards']
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: 'Application monitoring and error tracking platform',
    status: 'connected',
    logoPath: '/images/logos/sentry.png',
    category: 'monitoring',
    features: ['Error Tracking', 'Performance', 'Releases', 'Alerts']
  },
  {
    id: 'newrelic',
    name: 'New Relic',
    description: 'Full-stack observability platform for modern cloud environments',
    status: 'available',
    logoPath: '/images/logos/newrelic.png',
    category: 'monitoring',
    features: ['APM', 'Infrastructure', 'Browser', 'Mobile', 'Synthetics']
  },
  {
    id: 'splunk',
    name: 'Splunk',
    description: 'Platform for searching, monitoring, and analyzing machine data',
    status: 'available',
    logoPath: '/images/logos/splunk.png',
    category: 'logging',
    features: ['Log Analytics', 'SIEM', 'IT Operations', 'Business Analytics']
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    description: 'Open-source monitoring system with time series database',
    status: 'available',
    logoPath: '/images/logos/prometheus.png',
    category: 'monitoring',
    features: ['Time Series', 'Alerting', 'Service Discovery', 'PromQL']
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Multi-platform analytics and monitoring solution',
    status: 'available',
    logoPath: '/images/logos/grafana.png',
    category: 'monitoring',
    features: ['Dashboards', 'Alerting', 'Data Sources', 'Visualization']
  },
  {
    id: 'elastic',
    name: 'Elastic Stack',
    description: 'Search and analytics engine for logs, metrics, and security',
    status: 'available',
    logoPath: '/images/logos/elastic.png',
    category: 'logging',
    features: ['Elasticsearch', 'Logstash', 'Kibana', 'Beats']
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    description: 'Digital operations management platform for incident response',
    status: 'available',
    logoPath: '/images/logos/pagerduty.png',
    category: 'monitoring',
    features: ['Incident Management', 'On-Call', 'Escalation', 'Analytics']
  },
  {
    id: 'honeycomb',
    name: 'Honeycomb',
    description: 'Observability platform for debugging production systems',
    status: 'coming_soon',
    logoPath: '/images/logos/honeycomb.png',
    category: 'apm',
    features: ['Distributed Tracing', 'Events', 'Queries', 'SLOs']
  },
  {
    id: 'lightstep',
    name: 'Lightstep',
    description: 'Observability platform for microservices and distributed systems',
    status: 'coming_soon',
    logoPath: '/images/logos/lightstep.png',
    category: 'apm',
    features: ['Distributed Tracing', 'Metrics', 'Change Intelligence']
  },
  {
    id: 'dynatrace',
    name: 'Dynatrace',
    description: 'AI-powered full-stack monitoring platform',
    status: 'available',
    logoPath: '/images/logos/dynatrace.png',
    category: 'monitoring',
    features: ['AI Analytics', 'Full Stack', 'User Experience', 'Cloud Native']
  },
  {
    id: 'sumo-logic',
    name: 'Sumo Logic',
    description: 'Cloud-native machine data analytics platform',
    status: 'coming_soon',
    logoPath: '/images/logos/sumologic.png',
    category: 'logging',
    features: ['Log Management', 'Metrics', 'Security Analytics', 'Cloud SIEM']
  }
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'monitoring', 'logging', 'apm', 'infrastructure', 'security'];
  
  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesCategory;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const availableCount = integrations.filter(i => i.status === 'available').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
                Integrations
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                Connect your observability platforms to create unified dashboards and streamline incident investigation across all your monitoring tools.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {connectedCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Connected</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {availableCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
              </div>
              <Link
                href="/investigate"
                className="inline-flex items-center gap-2 bg-[#FEC601] hover:bg-[#E6B301] text-black px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start Investigation
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-[#FEC601] text-black shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No integrations found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const statusConfig = {
    connected: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-500',
      label: 'Connected'
    },
    available: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      dot: 'bg-[#FEC601]',
      label: 'Available'
    },
    coming_soon: {
      bg: 'bg-gray-50 dark:bg-gray-900',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-600 dark:text-gray-400',
      dot: 'bg-gray-400',
      label: 'Coming Soon'
    }
  };

  const status = statusConfig[integration.status];

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800/50 rounded-md p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
            <img 
              src={integration.logoPath} 
              alt={`${integration.name} logo`} 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // Use placeholder SVG if logo fails to load
                const target = e.target as HTMLImageElement;
                target.src = '/images/logos/placeholder.svg';
                target.onerror = null; // Prevent infinite loop
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                {integration.name}
              </h3>
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${status.bg} ${status.border} ${status.text} mt-1`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
                {status.label}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
            {integration.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 4).map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {feature}
              </span>
            ))}
            {integration.features.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                +{integration.features.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 