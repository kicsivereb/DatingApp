using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Errors
{
    public class ApiException
    {
        public int StatusCode {get;set;}
        public string Message {get;set;}
        public string Details{get;set;}
        private string v;

        public ApiException(int statusCode, string v)
        {
            this.StatusCode = statusCode;
            this.v = v;
        }

        public ApiException(int statusCode, string message, string v)
        {
            this.StatusCode = statusCode;
            this.Message = message;
            this.v = v;
        
        }

    }
}