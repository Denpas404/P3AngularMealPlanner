import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule  } from '@angular/forms';
import { Recipe, RecipeDTO } from '../Interfaces';
import { RecipeServiceService } from '../service/recipe-service.service';
import { LoginService } from '../service/login.service';


@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.css']
})
export class CreateRecipeComponent implements OnInit {
  form: FormGroup; // the form binding to the html, this is what we use to get the values from the form
  categories: string[] = []; // string array to store fetched categories

  loading: boolean = false; // conrol the spinner


  // constructor initializes the form with default values, for now they are test values.
  // since ingredients and instructions are arrays, we need to initialize them as an array instead of single values
  // we also inject the createRecipeService so we can fetch from our API
  constructor(private formBuilder: FormBuilder,
    private recipeService: RecipeServiceService,
    private tokenService: LoginService
    ) {
    this.form = this.formBuilder.group({
      title: 'test',
      category: 'test',
      description: 'test',
      prepTime: 123,
      cookTime: 123,
      servings: 123,
      rating: 1.5,
      ingredients: this.formBuilder.array([]),
      instructions: this.formBuilder.array([]),
    });

    // this is to initialize the form with one ingredient and one instruction
    // since before we initialize the form with empty arrays, we need to add one ingredient and one instruction
    // for it to render the form properly
    this.addIngredients();
    this.addInstruction();
  }
  ngOnInit(): void {
    this.recipeService.getCategories().subscribe({
      next: categories => {
        this.categories = categories.map(category => category.categoryName);
      },
      error: error => console.error('There was an error!', error)
    });

  }

  // this is to get the ingredients and instructions from the form
  // remember the ingredients is an array, so this is a way we can access it.
  // we also store all the ingredients here, so we can easily send it to the backend
  get ingredients(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  // this is to add ingredients to the form
  // it pushes the data to the last index of the array
  addIngredients() {
    this.ingredients.push(this.createIngredientFormGroup());
  }

  // this is to remove the last ingredient from the form
  // we need to check if the length is greater than 1, because we don't want to have 0 ingredients
  // this also ensures the form renders properly
  removeIngredients() {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(this.ingredients.length - 1);
    }
  }

  // this is to create the form group for the ingredients
  // we need to create a form group for each ingredient, because each ingredient is an array
  // this is all to reflect our interface and make it easier to post to the backend
  createIngredientFormGroup() {
    return new FormGroup({
      name: new FormControl(''),
      amounts: new FormControl(''),
      unit: new FormControl('')
    });
  }

  // this is to get the instructions from the form
  // works like the ingredients
  get instructions(): FormArray {
    return this.form.get('instructions') as FormArray;
  }

  addInstruction() {
    this.instructions.push(this.createInstructionFormGroup());
  }

  removeLastInstruction() {
    if (this.instructions.length > 1) {
      this.instructions.removeAt(this.instructions.length - 1);
    }
  }

  createInstructionFormGroup() {
    return new FormGroup({
      text: new FormControl('')
    });
  }


  // Handles the submit button
  // we need to check if the form is valid, if it is, we can send it to the backend
  // we also need to format the data to match our interface

  // we use the CreateRecipe interface since this is excluding the ID's
  // the database created the ID's automatically, so we don't need to worry about that
  onSubmit() {
    if (this.form.valid) {
      this.loading = true;

      const formattedRecipe: RecipeDTO = {
        title: this.form.get('title')?.value,
        description: this.form.get('description')?.value ,
        category: this.form.get('category')?.value ,
        preparationTime: this.form.get('prepTime')?.value,
        cookingTime: this.form.get('cookTime')?.value,
        servings: this.form.get('servings')?.value,
        rating: this.form.get('rating')?.value,
        ingredients: this.ingredients.controls.map(control => ({
          name: control.get('name')?.value,
          amount: {
            quantity: control.get('amounts')?.value,
          },
          unit: {
            measurement: control.get('unit')?.value
          }
        })),
        instructions: this.instructions.controls.map(control => ({
          text: control.get('text')?.value
        })),
        user: {
          id: this.tokenService.getIdFromToken()!,
          username: this.tokenService.getUsernameFromToken()!
        }
      };


      console.log(formattedRecipe);
    //   this.recipeService.createRecipe(formattedRecipe).subscribe({
    //     next: response => {
    //       console.log('Recipe created successfully', response);
    //       this.form.reset();
    //     },
    //     error: error => console.error('There was an error!', error),
    //     complete: () => {
    //       this.loading = false
    //       this.onReset();
    //       }
    //     });
    // } else {
    //   console.log('Form is invalid');
    this.loading = false
    }

  }
  
  // this is to reset the form
  // since the button with type reset, deletes all inputs but doesn't take into account the number of arrays
  // we also need to reset the arrays to 1
  onReset(){
    for (let i = this.ingredients.length; i >= 1; i--) {
      this.removeIngredients();
    }

    for (let i = this.instructions.length; i >= 1; i--) {
      this.removeLastInstruction();
    }

  }

  // this is to restrict the rating to be between 0 and 5
  // if you try to type a number that is less than 0, it will automatically set it to 0
  // if you try to type a number that is greater than 5, it will automatically set it to 5
  validateRating() {
    const ratingControl = this.form.get('rating');

    if (ratingControl!.value < 0) {
      ratingControl!.setValue(0);
    } else if (ratingControl!.value > 5) {
      ratingControl!.setValue(5);
    }
  }

  // this is to restrict a given controller to be greater than 0
  aboveZero(inputElement: EventTarget, controlName: string){
    const value = parseFloat((inputElement as HTMLInputElement).value);
    if (value < 0) {
      this.form.get(controlName)?.setValue(0);
    }
  }

  // this is to restrict the ingredient amount to be greater than 0
  aboveZeroIngredient(){
    const value = parseFloat(this.ingredients.controls[0].get('amounts')?.value);

    if (value < 0) this.ingredients.controls[0].get('amounts')?.setValue(0);

  }

  

}

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
// import { CreateRecipeService } from '../service/create-recipe.service'; // Import your service
// import { CreateRecipe } from '../Interfaces'; // Assuming you have an interface for CreateRecipe

// @Component({
//   selector: 'app-create-recipe',
//   templateUrl: './create-recipe.component.html',
//   styleUrls: ['./create-recipe.component.css']
// })
// export class CreateRecipeComponent {
//   form: FormGroup;
//   categories: string[] = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'];
//   loading: boolean = false;

//   constructor(
//     private formBuilder: FormBuilder,
//     private recipeFormService: CreateRecipeService // Inject your service
//   ) {
//     this.form = this.formBuilder.group({
//       id: 0, // Set the default value for id
//       title: 'string',
//       description: 'string',
//       category: this.formBuilder.group({
//         id: 0,
//         categoryName: 'string',
//       }),
//       preparationTimes: this.formBuilder.group({
//         id: 0,
//         minutes: 0,
//       }),
//       cookingTimes: this.formBuilder.group({
//         id: 0,
//         minutes: 0,
//       }),
//       servings: this.formBuilder.group({
//         id: 0,
//         quantity: 0,
//       }),
//       ratings: this.formBuilder.array([
//         this.formBuilder.group({
//           id: 0,
//           score: 0,
//         }),
//       ]),
//       ingredients: this.formBuilder.array([
//         this.formBuilder.group({
//           id: 0,
//           name: 'string',
//           amount: this.formBuilder.group({
//             id: 0,
//             quantity: 0,
//           }),
//           unit: this.formBuilder.group({
//             id: 0,
//             measurement: 'string',
//           }),
//         }),
//       ]),
//       instructions: this.formBuilder.array([
//         this.formBuilder.group({
//           id: 0,
//           text: 'string',
//         }),
//       ]),
//       userId: 0,
//     });
//   }


//   get ingredients(): FormArray {
//     return this.form.get('ingredients') as FormArray;
//   }

//   addIngredients() {
//     this.ingredients.push(this.createIngredientFormGroup());
//   }

//   removeIngredients() {
//     if (this.ingredients.length > 1) {
//       this.ingredients.removeAt(this.ingredients.length - 1);
//     }
//   }

//   createIngredientFormGroup() {
//     return new FormGroup({
//       name: new FormControl(''),
//       amounts: new FormControl(''),
//       unit: new FormControl('')
//     });
//   }

//   get instructions(): FormArray {
//     return this.form.get('instructions') as FormArray;
//   }

//   addInstruction() {
//     this.instructions.push(this.createInstructionFormGroup());
//   }

//   removeLastInstruction() {
//     if (this.instructions.length > 1) {
//       this.instructions.removeAt(this.instructions.length - 1);
//     }
//   }

//   createInstructionFormGroup() {
//     return new FormGroup({
//       text: new FormControl('')
//     });
//   }

//   onSubmit() {
//     if (this.form.valid) {
//       const formattedRecipe: CreateRecipe = this.form.value;
//       this.recipeFormService.createRecipe(formattedRecipe).subscribe({
//         next: response => {
//           console.log('Recipe created successfully', response);
//           this.form.reset();
//         },
//         error: error => {
//           console.error('There was an error!', error);
//         },
//       });
//     } else {
//       console.log('Form is invalid');
//     }
//   }

//   onReset() {
//     for (let i = this.ingredients.length; i >= 1; i--) {
//       this.removeIngredients();
//     }

//     for (let i = this.instructions.length; i >= 1; i--) {
//       this.removeLastInstruction();
//     }
//   }

//   validateRating() {
//     const ratingControl = this.form.get('rating');

//     if (ratingControl!.value < 0) {
//       ratingControl!.setValue(0);
//     } else if (ratingControl!.value > 5) {
//       ratingControl!.setValue(5);
//     }
//   }

//   aboveZero(inputElement: EventTarget, controlName: string) {
//     const value = parseFloat((inputElement as HTMLInputElement).value);
//     if (value < 0) {
//       this.form.get(controlName)?.setValue(0);
//     }
//   }

//   aboveZeroIngredient() {
//     const value = parseFloat(this.ingredients.controls[0].get('amounts')?.value);

//     if (value < 0) this.ingredients.controls[0].get('amounts')?.setValue(0);
//   }
// }
