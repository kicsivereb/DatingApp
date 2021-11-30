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
using Microsoft.AspNetCore.Http;
using API.Extensions;
using API.Helpers;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserRepository userRepository;
        private readonly IMapper mapper;
        private readonly IPhotoService photoService;

        public UsersController(IUserRepository userRepository, IMapper mapper,
         IPhotoService photoService)
        {
            this.photoService = photoService;
            this.userRepository = userRepository;
            this.mapper = mapper;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery] UserParams userParams)
        {
            var user = await this.userRepository.GetUserByUsernameAsync(User.GetUsername());
            userParams.CurrentUsername = user.UserName;

            if (string.IsNullOrEmpty(userParams.Gender))
                userParams.Gender = user.Gender == "male" ? "female" : "male";

            PagedList<MemberDto> users = await userRepository.GetMembersAsync(userParams);

            this.Response.AddPaginationHeader(
                users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages
            );

            return this.Ok(users);
        }


        [HttpGet("{username}", Name = "GetUser")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            return await userRepository.GetMemberAsync(username);

        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {

            AppUser user = await this.userRepository.GetUserByUsernameAsync(User.GetUsername());

            this.mapper.Map(memberUpdateDto, user);

            this.userRepository.Update(user);

            if (await this.userRepository.SaveAllAsync())
            {

                return this.NoContent();
            }

            return this.BadRequest("Failed to update user");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await this.userRepository.GetUserByUsernameAsync(User.GetUsername());
            var result = await this.photoService.AddPhotoAsync(file);

            if (result.Error != null)
            {
                return this.BadRequest(result.Error.Message);
            }

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };

            if (user.Photos.Count == 0)
            {
                photo.IsMain = true;
            }

            user.Photos.Add(photo);

            if (await this.userRepository.SaveAllAsync())
            {

                return this.CreatedAtRoute("GetUser", new { username = user.UserName }, this.mapper.Map<PhotoDto>(photo));
            }

            return this.BadRequest("Problem adding photo");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {

            string userName = this.User.GetUsername();

            AppUser user = await this.userRepository.GetUserByUsernameAsync(userName);

            Photo photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

            if (photo.IsMain == true)
            {
                return this.BadRequest("This is already your main photo");
            }

            Photo currentMain = user.Photos.FirstOrDefault(x => x.IsMain == true);

            if (currentMain != null)
            {
                currentMain.IsMain = false;
            }

            photo.IsMain = true;

            if (await this.userRepository.SaveAllAsync())
            {
                return this.NoContent();
            }

            return this.BadRequest("Failed to set main photo");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            AppUser user = await this.userRepository.GetUserByUsernameAsync(this.User.GetUsername());

            Photo photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            if (photo == null)
            {
                return this.NotFound();
            }

            if (photo.IsMain)
            {
                return this.BadRequest("You cannot delete your main photo");
            }

            if (photo.PublicId != null)
            {
                var result = await this.photoService.DeletePhotoAsync(photo.PublicId);

                if (result.Error != null)
                {
                    return this.BadRequest(result.Error.Message);
                }
            }

            user.Photos.Remove(photo);

            if (await this.userRepository.SaveAllAsync())
            {
                return this.Ok();
            }
            return this.BadRequest("Failed to delete photo");
        }

    }
}