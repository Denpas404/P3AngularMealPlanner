﻿using Meal_Planner_Api.Dto;
using Meal_Planner_Api.Models;

namespace Meal_Planner_Api.Interfaces
{
    public interface IRecipeRepository
    {
        ICollection<Recipe> GetRecipes();
        ICollection<Ingredient> GetIngredients(int recipeId);
        ICollection<Recipe> GetUserRecipes(int userId);
        Recipe GetRecipe(int id);
        Recipe GetRecipe(string name);
        float GetRecipeRating(int recipeId);
        bool RecipeExists(int recipeId);
        bool CreateRecipe(Recipe recipe, List<int> ratingIds, List<int> ingredientIds);
        bool UpdateRecipe(Recipe recipe);
        bool DeleteRecipe(Recipe recipe);
        bool Save();

    }
}
