# gitfame-backend

Uses GitHub GraphQL API v4.

Install mongodb `sudo apt install mongodb-server`

Run mongodb `sudo service mongodb start`

To run `node server.js`

`GET <url>/users/<username>`

Response:
```json
{
  "success": true,
  "public_repos": 21,
  "avatar_url": "https://avatars1.githubusercontent.com/u/15127115?v=4",
  "followers": 2,
  "following": 1,
  "html_url": "https://github.com/samkit-jain",
  "login": "samkit-jain",
  "name": "Samkit Jain",
  "bio": "Developer.",
  "commits": 168,
  "stars": 5,
  "forks": 0,
  "repos": [
    {
      "full_name": "samkit-jain/Handwriting-Recognition",
      "stargazers_count": 2,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/Handwriting-Recognition",
      "all_commits": 39,
      "commits": 39
    },
    {
      "full_name": "samkit-jain/pwa-imgur",
      "stargazers_count": 2,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/pwa-imgur",
      "all_commits": 24,
      "commits": 24
    },
    {
      "full_name": "samkit-jain/Data-Science-by-Siraj-Raval",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/Data-Science-by-Siraj-Raval",
      "all_commits": 20,
      "commits": 20
    },
    {
      "full_name": "hereisnaman/gitfame-backend",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "hereisnaman",
      "forks_count": 1,
      "html_url": "https://github.com/hereisnaman/gitfame-backend",
      "all_commits": 18,
      "commits": 11
    },
    {
      "full_name": "samkit-jain/Yoda",
      "stargazers_count": 1,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/Yoda",
      "all_commits": 10,
      "commits": 10
    },
    {
      "full_name": "samkit-jain/Make-Me-Do-It",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/Make-Me-Do-It",
      "all_commits": 8,
      "commits": 7
    },
    {
      "full_name": "samkit-jain/LinkedIn-Resume-Parser",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/LinkedIn-Resume-Parser",
      "all_commits": 7,
      "commits": 7
    },
    {
      "full_name": "samkit-jain/inkredo-assignment",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/inkredo-assignment",
      "all_commits": 7,
      "commits": 7
    },
    {
      "full_name": "samkit-jain/Textractor",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/Textractor",
      "all_commits": 11,
      "commits": 6
    },
    {
      "full_name": "samkit-jain/WiFi-State",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/WiFi-State",
      "all_commits": 7,
      "commits": 6
    },
    {
      "full_name": "samkit-jain/USACO-Training",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/USACO-Training",
      "all_commits": 5,
      "commits": 5
    },
    {
      "full_name": "samkit-jain/Motivation-Watch-Face",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/Motivation-Watch-Face",
      "all_commits": 5,
      "commits": 5
    },
    {
      "full_name": "samkit-jain/musique-app",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/musique-app",
      "all_commits": 4,
      "commits": 4
    },
    {
      "full_name": "samkit-jain/Contacts-Search-App",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/Contacts-Search-App",
      "all_commits": 4,
      "commits": 4
    },
    {
      "full_name": "samkit-jain/TransparentWidget",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/TransparentWidget",
      "all_commits": 4,
      "commits": 3
    },
    {
      "full_name": "samkit-jain/musique-api",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/musique-api",
      "all_commits": 3,
      "commits": 3
    },
    {
      "full_name": "samkit-jain/Live-Battery-Wallpaper",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/Live-Battery-Wallpaper",
      "all_commits": 3,
      "commits": 2
    },
    {
      "full_name": "samkit-jain/CTWapp",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/CTWapp",
      "all_commits": 3,
      "commits": 2
    },
    {
      "full_name": "samkit-jain/Add-to-cart-on-Snapdeal",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/Add-to-cart-on-Snapdeal",
      "all_commits": 2,
      "commits": 2
    },
    {
      "full_name": "samkit-jain/and-nd-firebase-1.00-starting-point",
      "stargazers_count": 0,
      "watchers_count": 1,
      "owner_login": "samkit-jain",
      "forks_count": 0,
      "html_url": "https://github.com/samkit-jain/and-nd-firebase-1.00-starting-point",
      "all_commits": 1,
      "commits": 1
    },
    {
      "full_name": "PhilJay/MPAndroidChart",
      "stargazers_count": 19274,
      "watchers_count": 940,
      "owner_login": "PhilJay",
      "forks_count": 5385,
      "html_url": "https://github.com/PhilJay/MPAndroidChart",
      "all_commits": 1909,
      "commits": 0
    }
  ]
}
```