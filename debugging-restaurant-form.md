# Restaurant Form Validation Debug Guide

## Problem Summary
The Save Restaurant button remains disabled even after entering required fields due to validation logic issues.

## Step-by-Step Debugging Process

### Step 1: Check Form State
Add these debug console logs to the RestaurantForm component:

```javascript
// Add after the useFormValidation hook
console.log('Debug - Form State:', {
  data,
  errors,
  touched,
  isValid,
  isDirty,
  schemaKeys: Object.keys(validationSchema)
});
```

### Step 2: Check Required Fields Validation
The current validation schema has these required fields:
- `name` (required: true)
- `cuisine` (required: true)

But the validation logic only adds errors to touched fields. Check if fields are being marked as touched.

### Step 3: Validate Field Mapping
Current form data vs API expectations:

| Form Field | API Field | Status |
|------------|-----------|---------|
| name | name | ✅ Match |
| description | - | ❌ Not in API |
| cuisine | cuisine_type | ❌ Mismatch |
| address | address | ✅ Match |
| phone | phone | ✅ Match |
| website | - | ❌ Not in API |
| rating | rating | ✅ Match |
| priceRange | price_range | ❌ Mismatch |
| isFavorite | is_favorite | ❌ Mismatch |

### Step 4: Check Validation Trigger Logic
The `isValid` calculation in useFormValidation (line 130-132):
```javascript
const isValid = useMemo(() => {
  return Object.keys(errors).length === 0
}, [errors])
```

This only checks if errors object is empty, but doesn't validate untouched required fields.

### Step 5: Verify Button State Logic
In RestaurantForm (line 445):
```javascript
disabled={isLoading || !isValid}
```

## Issues Found

### 1. Field Name Mismatches
- `cuisine` should map to `cuisine_type`
- `priceRange` should map to `price_range`  
- `isFavorite` should map to `is_favorite`

### 2. Validation Logic Gap
- Required fields are only validated when touched
- Button remains disabled until all required fields are touched AND valid
- Need to validate all required fields on form load

### 3. Form Data Transformation
- Form data structure doesn't match API expectations
- Need data transformation before API calls

## Solutions

### 1. Fix Field Mappings
Update validation schema and form submission to handle field name mapping.

### 2. Update Validation Logic
Modify `useFormValidation` to validate required fields immediately.

### 3. Add Data Transformation
Transform form data to API format before submission.

### 4. Improve Button Logic
Make sure `isValid` properly reflects form validation state.

## Testing Steps

1. **Load Form**: Check if required fields are immediately validated
2. **Enter Name**: Verify name field validation works
3. **Enter Cuisine**: Verify cuisine field validation works  
4. **Check Button**: Button should become enabled when required fields are filled
5. **Submit Form**: Verify data is transformed correctly for API

## Expected Behavior

After fixes:
1. Form loads with proper validation state
2. Required fields (name, cuisine) are validated immediately
3. Button becomes enabled when required fields are valid
4. Form data is correctly transformed for API submission
5. All field mappings work correctly

## Debug Commands

Add these to test validation state:

```javascript
// Check validation state
console.log('Validation State:', {
  requiredFields: ['name', 'cuisine'],
  fieldValues: { name: data.name, cuisine: data.cuisine },
  fieldErrors: { name: errors.name, cuisine: errors.cuisine },
  fieldsTouched: { name: touched.name, cuisine: touched.cuisine },
  overallValid: isValid
});

// Test manual validation
const manualValidation = Object.keys(validationSchema).every(field => {
  const rule = validationSchema[field];
  const value = data[field];
  
  if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    console.log(`Required field missing: ${field}`);
    return false;
  }
  return true;
});
console.log('Manual validation result:', manualValidation);
```