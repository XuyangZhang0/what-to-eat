import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './src/components/LoginForm';
import MealForm from './src/components/MealForm';
import RestaurantForm from './src/components/RestaurantForm';
import TagManager from './src/components/TagManager';

// Mock APIs and hooks
vi.mock('./src/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('./src/services/api', () => ({
  mealsApi: {
    createMeal: vi.fn(),
    updateMeal: vi.fn(),
    getCuisineTypes: vi.fn().mockResolvedValue(['Italian', 'Chinese']),
  },
  restaurantsApi: {
    createRestaurant: vi.fn(),
    updateRestaurant: vi.fn(),
    getCuisineTypes: vi.fn().mockResolvedValue(['Italian', 'Chinese']),
  },
  tagsApi: {
    getTags: vi.fn().mockResolvedValue([]),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
    getUnusedTags: vi.fn().mockResolvedValue([]),
    getMostUsedTags: vi.fn().mockResolvedValue([]),
    getTagUsage: vi.fn().mockResolvedValue({ mealCount: 0, restaurantCount: 0, totalCount: 0 }),
    deleteUnusedTags: vi.fn(),
  },
}));

vi.mock('./src/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    data: {},
    errors: {},
    touched: {},
    isValid: false,
    isDirty: false,
    updateField: vi.fn(),
    validate: vi.fn().mockReturnValue(false),
    reset: vi.fn(),
  }),
}));

vi.mock('./src/hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    autoSaveState: {
      isDirty: false,
      isAutoSaving: false,
      hasErrors: false,
    },
    saveImmediately: vi.fn(),
    cancelAutoSave: vi.fn(),
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Form Button Analysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginForm', () => {
    it('should have submit button disabled when loading', () => {
      // Mock loading state
      vi.mocked(require('./src/hooks/useAuth').useAuth).mockReturnValue({
        login: vi.fn(),
        isLoading: true,
      });

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button with valid email and password', () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('MealForm', () => {
    it('should have save button disabled when form is invalid', () => {
      render(
        <TestWrapper>
          <MealForm
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </TestWrapper>
      );

      const saveButton = screen.getByRole('button', { name: /save meal/i });
      expect(saveButton).toBeDisabled();
    });

    it('should have save button disabled when loading', () => {
      render(
        <TestWrapper>
          <MealForm
            onSave={vi.fn()}
            onCancel={vi.fn()}
            isLoading={true}
          />
        </TestWrapper>
      );

      const saveButton = screen.getByRole('button', { name: /saving/i });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('RestaurantForm', () => {
    it('should have save button disabled when form is invalid', () => {
      render(
        <TestWrapper>
          <RestaurantForm
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </TestWrapper>
      );

      const saveButton = screen.getByRole('button', { name: /save restaurant/i });
      expect(saveButton).toBeDisabled();
    });

    it('should have save button disabled when loading', () => {
      render(
        <TestWrapper>
          <RestaurantForm
            onSave={vi.fn()}
            onCancel={vi.fn()}
            isLoading={true}
          />
        </TestWrapper>
      );

      const saveButton = screen.getByRole('button', { name: /saving/i });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('TagManager Form', () => {
    it('should have add button disabled when tag name is empty', async () => {
      render(
        <TestWrapper>
          <TagManager />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        const addTagButton = screen.getByText('Add Tag');
        fireEvent.click(addTagButton);
      });

      const submitButton = screen.getByRole('button', { name: /add tag/i });
      expect(submitButton).toBeDisabled();
    });
  });
});