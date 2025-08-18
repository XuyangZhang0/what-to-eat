import { Meal, Restaurant } from '@/types'
import { Tag, ExportData, ImportResult } from '@/types/api'
import { mealsApi, restaurantsApi, tagsApi } from '@/services/api'

export const exportData = async (): Promise<void> => {
  try {
    const [meals, restaurants, tags] = await Promise.all([
      mealsApi.getMeals(),
      restaurantsApi.getRestaurants(),
      tagsApi.getTags(),
    ])

    const exportData: ExportData = {
      meals,
      restaurants,
      tags,
      exportDate: new Date().toISOString(),
      version: '1.0',
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `what-to-eat-backup-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  } catch (error) {
    console.error('Error exporting data:', error)
    throw new Error('Failed to export data')
  }
}

export const importData = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const data: ExportData = JSON.parse(content)
        
        // Validate data structure
        if (!data.meals || !data.restaurants || !data.tags) {
          throw new Error('Invalid backup file format')
        }

        const result: ImportResult = {
          success: true,
          importedMeals: 0,
          importedRestaurants: 0,
          importedTags: 0,
          errors: [],
        }

        // Import tags first (they're referenced by meals and restaurants)
        for (const tag of data.tags) {
          try {
            await tagsApi.createTag({ name: tag.name, color: tag.color })
            result.importedTags++
          } catch (error) {
            result.errors.push(`Failed to import tag "${tag.name}": ${error}`)
          }
        }

        // Import meals
        for (const meal of data.meals) {
          try {
            await mealsApi.createMeal({
              name: meal.name,
              description: meal.description,
              category: meal.category,
              cuisine: meal.cuisine,
              difficulty: meal.difficulty,
              cookingTime: meal.cookingTime,
              tags: meal.tags,
              ingredients: meal.ingredients,
              instructions: meal.instructions,
              isFavorite: meal.isFavorite,
            })
            result.importedMeals++
          } catch (error) {
            result.errors.push(`Failed to import meal "${meal.name}": ${error}`)
          }
        }

        // Import restaurants
        for (const restaurant of data.restaurants) {
          try {
            await restaurantsApi.createRestaurant({
              name: restaurant.name,
              description: restaurant.description,
              cuisine: restaurant.cuisine,
              address: restaurant.address,
              phone: restaurant.phone,
              website: restaurant.website,
              rating: restaurant.rating,
              priceRange: restaurant.priceRange,
              isFavorite: restaurant.isFavorite,
            })
            result.importedRestaurants++
          } catch (error) {
            result.errors.push(`Failed to import restaurant "${restaurant.name}": ${error}`)
          }
        }

        resolve(result)
      } catch (error) {
        reject(new Error('Failed to parse or import data'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export const generateReport = async (): Promise<string> => {
  try {
    const [meals, restaurants, tags] = await Promise.all([
      mealsApi.getMeals(),
      restaurantsApi.getRestaurants(),
      tagsApi.getTags(),
    ])

    const mealsByCuisine = meals.reduce((acc, meal) => {
      const cuisine = meal.cuisine || 'Unknown'
      acc[cuisine] = (acc[cuisine] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mealsByDifficulty = meals.reduce((acc, meal) => {
      const difficulty = meal.difficulty || 'Unknown'
      acc[difficulty] = (acc[difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mealsByCategory = meals.reduce((acc, meal) => {
      const category = meal.category
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const restaurantsByCuisine = restaurants.reduce((acc, restaurant) => {
      const cuisine = restaurant.cuisine
      acc[cuisine] = (acc[cuisine] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const restaurantsByPrice = restaurants.reduce((acc, restaurant) => {
      const price = restaurant.priceRange || 'Unknown'
      acc[price] = (acc[price] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteCount = {
      meals: meals.filter(m => m.isFavorite).length,
      restaurants: restaurants.filter(r => r.isFavorite).length,
    }

    const report = `
# What to Eat - Usage Report

Generated on: ${new Date().toLocaleString()}

## Summary
- **Total Meals**: ${meals.length}
- **Total Restaurants**: ${restaurants.length}
- **Total Tags**: ${tags.length}
- **Favorite Meals**: ${favoriteCount.meals}
- **Favorite Restaurants**: ${favoriteCount.restaurants}

## Meals Analysis

### By Category
${Object.entries(mealsByCategory).map(([category, count]) => `- ${category}: ${count}`).join('\n')}

### By Cuisine
${Object.entries(mealsByCuisine).map(([cuisine, count]) => `- ${cuisine}: ${count}`).join('\n')}

### By Difficulty
${Object.entries(mealsByDifficulty).map(([difficulty, count]) => `- ${difficulty}: ${count}`).join('\n')}

## Restaurants Analysis

### By Cuisine
${Object.entries(restaurantsByCuisine).map(([cuisine, count]) => `- ${cuisine}: ${count}`).join('\n')}

### By Price Range
${Object.entries(restaurantsByPrice).map(([price, count]) => `- ${price}: ${count}`).join('\n')}

## Tags
${tags.map(tag => `- ${tag.name} (${tag.color})`).join('\n')}

---
Generated by What to Eat Management System
`.trim()

    return report
  } catch (error) {
    console.error('Error generating report:', error)
    throw new Error('Failed to generate report')
  }
}

export const downloadReport = async (): Promise<void> => {
  const report = await generateReport()
  const dataUri = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(report)
  
  const exportFileDefaultName = `what-to-eat-report-${new Date().toISOString().split('T')[0]}.md`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}