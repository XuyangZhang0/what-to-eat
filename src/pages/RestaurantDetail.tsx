import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Share, 
  Navigation,
  Clock,
  DollarSign,
  Menu
} from 'lucide-react'
import { Restaurant } from '@/types'

// Mock restaurant data - replace with actual API call
const mockRestaurant: Restaurant = {
  id: '1',
  name: 'Pizza Palace',
  description: 'Authentic Italian pizza with fresh ingredients sourced directly from Italy. Family-owned restaurant serving the community for over 20 years.',
  cuisine: 'Italian',
  address: '123 Main Street, Downtown District, City 12345',
  phone: '+1 (555) 123-4567',
  website: 'https://pizzapalace.com',
  rating: 4.5,
  priceRange: '$$',
  image: '/images/pizza-palace.jpg',
  isOpen: true,
  distance: 500,
  isFavorite: false,
}

const mockHours = {
  monday: '11:00 AM - 10:00 PM',
  tuesday: '11:00 AM - 10:00 PM',
  wednesday: '11:00 AM - 10:00 PM',
  thursday: '11:00 AM - 10:00 PM',
  friday: '11:00 AM - 11:00 PM',
  saturday: '12:00 PM - 11:00 PM',
  sunday: '12:00 PM - 9:00 PM',
}

const mockMenuHighlights = [
  { name: 'Margherita Pizza', price: '$18', description: 'Fresh mozzarella, basil, tomato sauce' },
  { name: 'Pepperoni Classic', price: '$22', description: 'Traditional pepperoni with mozzarella' },
  { name: 'Truffle Mushroom', price: '$26', description: 'Wild mushrooms with truffle oil' },
  { name: 'Caesar Salad', price: '$14', description: 'Crisp romaine, parmesan, croutons' },
]

export default function RestaurantDetail() {
  const { id } = useParams()
  const [isFavorite, setIsFavorite] = useState(mockRestaurant.isFavorite)
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'hours'>('overview')

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
    // TODO: Update favorite status in backend/storage
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockRestaurant.name,
        text: mockRestaurant.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleDirections = () => {
    // Open maps app with directions
    const address = encodeURIComponent(mockRestaurant.address || '')
    window.open(`https://maps.google.com/maps?daddr=${address}`, '_blank')
  }

  const handleCall = () => {
    if (mockRestaurant.phone) {
      window.open(`tel:${mockRestaurant.phone}`)
    }
  }

  const handleWebsite = () => {
    if (mockRestaurant.website) {
      window.open(mockRestaurant.website, '_blank')
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Hero Image */}
      <motion.div
        className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Image placeholder */}
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-6xl font-bold text-muted-foreground opacity-50">
            {mockRestaurant.name.charAt(0)}
          </span>
        </div>
        
        {/* Status indicator */}
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            mockRestaurant.isOpen 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {mockRestaurant.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
          >
            <Share className="w-5 h-5" />
          </button>
          <button
            onClick={handleFavoriteToggle}
            className="w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Header Info */}
        <motion.div
          className="p-6 border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold flex-1">{mockRestaurant.name}</h1>
            <div className="flex items-center space-x-1 ml-4">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{mockRestaurant.rating}</span>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-4">{mockRestaurant.description}</p>
          
          {/* Meta info */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{mockRestaurant.cuisine}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3" />
              <span>{mockRestaurant.priceRange}</span>
            </div>
            {mockRestaurant.distance && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{Math.round(mockRestaurant.distance / 1000 * 10) / 10} km away</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="p-4 flex space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={handleDirections}
            className="flex-1 btn btn-primary btn-md"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Directions
          </button>
          <button 
            onClick={handleCall}
            className="btn btn-outline btn-md"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button 
            onClick={handleWebsite}
            className="btn btn-outline btn-md"
          >
            <Globe className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="px-4 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'menu' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'hours' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hours
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          className="p-4"
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Address */}
              <div className="p-4 bg-card rounded-lg border">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Address</h3>
                    <p className="text-sm text-muted-foreground">{mockRestaurant.address}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              {mockRestaurant.phone && (
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-sm text-muted-foreground">{mockRestaurant.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Popular Items</h3>
                <button className="text-sm text-primary hover:underline">
                  View full menu
                </button>
              </div>
              <div className="space-y-3">
                {mockMenuHighlights.map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-4 bg-card rounded-lg border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <span className="font-semibold text-primary ml-3">{item.price}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-3">
              {Object.entries(mockHours).map(([day, hours], index) => (
                <motion.div
                  key={day}
                  className="flex items-center justify-between p-3 bg-card rounded-lg border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="font-medium capitalize">{day}</span>
                  <span className="text-sm text-muted-foreground">{hours}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}