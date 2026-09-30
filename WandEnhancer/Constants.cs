using System;
using System.Reflection;
using WandEnhancer.Models;

namespace WandEnhancer
{
    public static class Constants
    {
        public const string RepoName = "Wand-Enhancer";
        public const string Owner = "k1tbyte";
        public static readonly string RepositoryUrl = $"https://github.com/{Owner}/{RepoName}";
        public static readonly Version Version;
        public static readonly string[] WeModBrandNames = { "Wand", "WeMod" };
        public const string AppSettingsFileName = "appsettings.json";
        
        public const string ProxyDllResouceName = "proxydll";

        static  Constants()
        {
            Version = Assembly.GetExecutingAssembly().GetName().Version;
        }
    }
}