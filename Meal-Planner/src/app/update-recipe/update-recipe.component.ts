import { Component, OnInit } from '@angular/core';
import { Amount, Unit, Ingredient, Recipe, Instruction, RecipeDTO } from '../Interfaces';
import { RecipeServiceService } from '../service/recipe-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { LoginService } from '../service/login.service';

@Component({
  selector: 'app-update-recipe',
  templateUrl: './update-recipe.component.html',
  styleUrls: ['./update-recipe.component.css']
})
export class UpdateRecipeComponent implements OnInit{
  updateForm: FormGroup;

  recipe: Recipe | undefined;
  recipeId: number | undefined;


  categories: string[] = [];

  get instructions(): FormArray {
    return this.updateForm.get('instructions') as FormArray;
  }
  
  get ingredients(): FormArray {
    return this.updateForm.get('ingredients') as FormArray;
  }
  

  

  constructor(
    private route: ActivatedRoute, 
    private recipeService: RecipeServiceService,
    private formBuilder: FormBuilder,
    private router: Router,
    private tokenService: LoginService
    ) 
    { 
      this.updateForm = this.formBuilder.group({
      title: '',
      category: '',
      description: '',
      prepTime: null,
      cookTime: null,
      servings: null,
      rating: null,
      ingredients: this.formBuilder.array([]),
      instructions: this.formBuilder.array([]),
      });
    }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.recipeId = Number(params.get('id'));

      if(!isNaN(this.recipeId)){

        this.recipeService.getRecipeById(this.recipeId).subscribe(recipe => {
          
          this.recipe = recipe;
          this.updateForm.patchValue({
            title: this.recipe!.title,
            description: this.recipe!.description,
            category: this.recipe!.category.categoryName,
            prepTime: this.recipe!.preparationTimes.minutes,
            cookTime: this.recipe!.cookingTimes.minutes,
            servings: this.recipe!.servings.quantity,
            rating: this.recipe!.ratings[0].score,
            ingredients: this.recipe!.ingredients,
            instructions: this.recipe!.instructions,
          });

          
          if (this.recipe!.ingredients && this.recipe!.ingredients.length > 0) {
            this.recipe!.ingredients.forEach((ingredient) => {
              const nameControl = new FormControl(ingredient.name);
              const valueControl = new FormControl(ingredient.amount.quantity);
              const unitControl = new FormControl(ingredient.unit.measurement);
        
              const ingredientGroup = this.formBuilder.group({
                name: nameControl,
                value: valueControl,
                unit: unitControl

              });
        
              this.ingredients.push(ingredientGroup);
            });
          }
        
          if (this.recipe!.instructions && this.recipe!.instructions.length > 0) {

            this.recipe!.instructions.forEach((instruction) => {

              const textControl = new FormControl(instruction.text);
              const instructionGroup = this.formBuilder.group({
                text: textControl
              });
              this.instructions.push(instructionGroup);

            });
          }


        });
      }
    });

    this.recipeService.getCategories().subscribe(categories => {
      this.categories = categories.map(category => category.categoryName)
    });





  }




  addIngredient(): void {
    this.ingredients.push(this.createIngredientGroup('', '', ''));
  }

  addInstruction(): void {
    this.instructions.push(this.createInstructionGroup(''));
  }

  removeIngredient(): void {
    if (this.ingredients.length > 0) {
      this.ingredients.removeAt(this.ingredients.length - 1);
    }
  }

  removeInstruction(): void {
    if (this.instructions.length > 0) {
      this.instructions.removeAt(this.instructions.length - 1);
    }
  }

  private createIngredientGroup(name: string, value: string, unit: string): FormGroup {
    return this.formBuilder.group({
      name: new FormControl(name),
      value: new FormControl(value),
      unit: new FormControl(unit)
    });
  }

  private createInstructionGroup(text: string): FormGroup {
    return this.formBuilder.group({
      text: new FormControl(text)
    });
  }



  updateRecipe(): void {
    if (this.updateForm.valid) {
      const recipeDTO: RecipeDTO = {
        Title: this.updateForm.get('title')!.value,
        Description: this.updateForm.get('description')!.value,
        Category: {
          CategoryName: this.updateForm.get('category')!.value
        },
        PreparationTimes: {
          Minutes: this.updateForm.get('prepTime')!.value
        },
        CookingTimes:{
          Minutes: this.updateForm.get('cookTime')!.value        
        },          
        Servings:{ 
          Quantity: this.updateForm.get('servings')!.value
        },
        Ratings: [{
          Score: this.updateForm.get('rating')!.value
        }],
        Ingredients: this.ingredients.controls.map(control => ({
          Name: control.get('name')?.value,
          Amount: {
            Quantity: control.get('value')?.value
          },
          Unit: {
            Measurement: control.get('unit')?.value
          }
        })),
        Instructions: this.instructions.controls.map(control => ({
          Text: control.get('text')?.value
        })),
        User: {
          Id: this.tokenService.getIdFromToken(),
          Username: this.tokenService.getUsernameFromToken()
        }
      };

      console.log(recipeDTO);
      this.recipeService.updateRecipe(recipeDTO, this.recipeId!).subscribe({
        next:(data: any) => {
          console.log("Success", data);
          this.router.navigate(['/recipe-detail/' + this.recipeId]);
        },
        error:(error) => {
          console.error("Update recipe error: ", error);
        }
      })
    }
  }
// test 1234
// co-author test
  
  // controls what the user can input for rating
  validateRating() {
    const ratingControl = this.updateForm.get('rating');

    if (ratingControl!.value < 0) {
      ratingControl!.setValue(0);
    } else if (ratingControl!.value > 5) {
      ratingControl!.setValue(5);
    }
  }

  goBack(){
    this.router.navigate(['/recipe-detail/' + this.recipeId]);
  }

}
