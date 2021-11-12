using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<AppUser, MemberDto>()
                .ForMember(
                    dto => dto.PhotoUrl,
                    opt => opt.MapFrom(
                        appUser => appUser.Photos.FirstOrDefault(photo => photo.IsMain).Url
                    )
                )
                .ForMember(
                    dto => dto.Age,
                    opt => opt.MapFrom(
                        appUser => appUser.DateOfBirth.CalculateAge()
                    )
                );
            CreateMap<Photo, PhotoDto>();
            CreateMap<MemberUpdateDto, AppUser>();
        }

        private void ForMember(Func<object, object> p1, Func<object, object> p2)
        {
            throw new NotImplementedException();
        }
    }
}