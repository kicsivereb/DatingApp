using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext Context;
        private readonly IMapper mapper;
        public UserRepository(DataContext context, IMapper mapper)
        {
            this.mapper = mapper;
            this.Context = context;
        }

        public async Task<MemberDto> GetMemberAsync(string username)
        {
            return await this.Context.Users
                .Where(x => x.UserName == username)
                .ProjectTo<MemberDto>(this.mapper.ConfigurationProvider)
                .SingleOrDefaultAsync();
        }

        public async Task<IEnumerable<MemberDto>> GetMembersAsync()
        {
            return await this.Context.Users
                .ProjectTo<MemberDto>(this.mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await Context.Users.FindAsync(id);
        }

        public async Task<AppUser> GetUserByUsernameAsync(string username)
        {
            AppUser user = await Context.Users
                .Where(x => x.UserName == username)
                .Include(p => p.Photos)
                .FirstOrDefaultAsync();

            // SELECT * FROM User u WHERE UserName LIKE 'lena' INNER JOIN Photos p ON u.Id = p.UserId

            return user;
        }

        public async Task<IEnumerable<AppUser>> GetUsersAsync()
        {
            return await Context.Users
                .Include(p => p.Photos)
                .ToListAsync();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await Context.SaveChangesAsync() > 0;
        }

        public void Update(AppUser user)
        {
            Context.Entry(user).State = EntityState.Modified;
        }
    }
}