using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using API.Interfaces;
using API.DTOs;
using AutoMapper;
using System.Security.Claims;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserRepository userRepository;
        private readonly IMapper mapper;

        public UsersController(IUserRepository userRepository, IMapper mapper)
        {
            this.userRepository = userRepository;
            this.mapper = mapper;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
        {
            IEnumerable<MemberDto> users = await userRepository.GetMembersAsync();

            return this.Ok(users);
        }


        [HttpGet("{username}")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            return await userRepository.GetMemberAsync(username);

        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            // Get the username of the currently logged in user
            // e.g. "lena"
            string username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Get the AppUser entity from the database
            AppUser user = await this.userRepository.GetUserByUsernameAsync(username);

            // Map memberUpdateDto to user
            // i.e., modify the AppUser entity (property values)
            // memberUpdateDto has the properties from the request.
            this.mapper.Map(memberUpdateDto, user);

            // Update the AppUser entity in the database (with the update property values)
            this.userRepository.Update(user);

            // Commit the database transaction
            if (await this.userRepository.SaveAllAsync())
            {
                // 204
                return this.NoContent();
            }

            // 400
            return BadRequest("Failed to update user");
        }


    }
}