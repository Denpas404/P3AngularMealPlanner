﻿using AutoMapper;
using Meal_Planner_Api.Dto;
using Meal_Planner_Api.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Meal_Planner_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PreparationTimeController : ControllerBase
    {
        private IMapper _mapper;
        private IPreparationTimeRepository _preparationTimeRepository;

        public PreparationTimeController(IMapper mapper, IPreparationTimeRepository preparationTimeRepository)
        {
            _mapper = mapper;
            _preparationTimeRepository = preparationTimeRepository;

        }

        // get all preparation times
        [HttpGet]
        public IActionResult Get()
        {
            var preparationTime = _mapper.Map<List<PreparationTimeDTO>>(_preparationTimeRepository.GetPreparationTimes());

            if(preparationTime == null)
                return NotFound("Not Found");

            if(!ModelState.IsValid)
                return BadRequest(ModelState);

            return Ok(preparationTime);
        }

        // get prep from id
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {

            if (!_preparationTimeRepository.PreparationTimeExists(id))
                return NotFound("Not Found");

            var preparationTime = _mapper.Map<PreparationTimeDTO>(_preparationTimeRepository.GetPreparationTime(id));

            if(!ModelState.IsValid)
                return BadRequest(ModelState);

            return Ok(preparationTime);
        }


        // get prep from recipe
        [HttpGet("byRecipe/{recpeId}")]
        IActionResult GetByRecipeId(int recipeId)
        {
            var preparationTime = _mapper.Map<PreparationTimeDTO>(_preparationTimeRepository.GetPreparationTimeFromRecipe(recipeId));

            if (preparationTime == null)
                return NotFound("Not Found");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            return Ok(preparationTime);
        }

    }
}