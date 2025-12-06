import React from 'react'
import DoodleIcons from './DoodleIcons'

const DoodleIconShowcase: React.FC = () => {
  const iconCategories = [
    {
      title: '🏠 Home & Life',
      icons: ['home', 'leaf', 'star']
    },
    {
      title: '🎨 Creative',
      icons: ['palette', 'art', 'music']
    },
    {
      title: '🌍 World & Culture',
      icons: ['globe', 'temple', 'chat']
    },
    {
      title: '🏃 Sports & Activity',
      icons: ['basketball', 'sports', 'circus']
    },
    {
      title: '📚 Education',
      icons: ['book', 'calculator', 'science']
    },
    {
      title: '🎯 Goals & Fun',
      icons: ['target', 'puzzle', 'question']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-rainbow mb-4 animate-heartbeat">
            🎨 Doodle Icons Showcase
          </h1>
          <p className="text-xl text-gray-600 animate-fade-in">
            ✨ Cute minimal flat icons in pastel doodle style ✨
          </p>
        </div>

        {/* Icon Categories */}
        <div className="space-y-12">
          {iconCategories.map((category, categoryIndex) => (
            <div key={category.title} className="animate-fade-in-up" style={{ animationDelay: `${categoryIndex * 200}ms` }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center animate-slide-up">
                {category.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {category.icons.map((iconName, iconIndex) => (
                  <div
                    key={iconName}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-4 border-pink-200 hover:border-pink-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-pink-100 to-rose-100 hover-lift animate-fade-in-up"
                    style={{ animationDelay: `${(categoryIndex * 200) + (iconIndex * 100)}ms` }}
                  >
                    <div className="text-center">
                      {/* Large Icon */}
                      <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-float">
                        <DoodleIcons name={iconName} size={40} className="text-white" />
                      </div>
                      
                      {/* Icon Name */}
                      <h3 className="text-lg font-bold text-gray-800 mb-2 capitalize animate-wiggle">
                        {iconName.replace('-', ' ')}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4">
                        {getIconDescription(iconName)}
                      </p>
                      
                      {/* Small Icons Row */}
                      <div className="flex justify-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md animate-bounce">
                          <DoodleIcons name={iconName} size={16} className="text-white" />
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '0.1s' }}>
                          <DoodleIcons name={iconName} size={16} className="text-white" />
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '0.2s' }}>
                          <DoodleIcons name={iconName} size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Usage Example */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-4 border-amber-200 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center animate-heartbeat">
            🚀 Usage Example
          </h2>
          
          <div className="bg-gray-900 rounded-2xl p-6 text-green-400 font-mono text-sm overflow-x-auto">
            <div className="mb-4">
              <span className="text-blue-400">import</span> DoodleIcons <span className="text-blue-400">from</span> <span className="text-yellow-400">'./DoodleIcons'</span>
            </div>
            <div className="mb-4">
              <span className="text-gray-500">// Usage:</span>
            </div>
            <div className="mb-2">
              <span className="text-pink-400">&lt;</span>DoodleIcons <span className="text-cyan-400">name</span>=<span className="text-yellow-400">"home"</span> <span className="text-cyan-400">size</span>=<span className="text-orange-400">24</span> <span className="text-cyan-400">className</span>=<span className="text-yellow-400">"text-blue-500"</span> <span className="text-pink-400">/&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getIconDescription = (iconName: string): string => {
  const descriptions: { [key: string]: string } = {
    'home': 'Cute house with chimney and garden',
    'palette': 'Colorful paint palette for creativity',
    'globe': 'Earth with continents and sparkles',
    'temple': 'Greek temple with columns',
    'chat': 'Speech bubble for communication',
    'leaf': 'Nature leaf with organic patterns',
    'basketball': 'Sports ball with dynamic lines',
    'question': 'Quiz symbol with question mark',
    'book': 'Education book with pages',
    'calculator': 'Math calculator with buttons',
    'science': 'Lab equipment for experiments',
    'music': 'Musical note with rhythm',
    'art': 'Paint brush with creative strokes',
    'sports': 'Running figure in motion',
    'star': 'Achievement star with sparkles',
    'target': 'Goal target with rings',
    'puzzle': 'Problem solving puzzle piece',
    'circus': 'Fun circus tent with flags'
  }
  
  return descriptions[iconName] || 'Beautiful doodle icon'
}

export default DoodleIconShowcase
