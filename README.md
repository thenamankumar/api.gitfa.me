# gitfame-backend

Uses GitHub GraphQL API v4.

Install mongodb `sudo apt install mongodb-server`

Run mongodb `sudo service mongodb start`

To run `node server.js`

`POST <url>/`

Parameters:
  name: String
  latest: boolean

Response:
```json
{
    "success": true,
    "public_repos": 22,
    "avatar_url": "https://avatars1.githubusercontent.com/u/15127115?v=4",
    "followers": 2,
    "following": 1,
    "html_url": "https://github.com/samkit-jain",
    "id": "MDQ6VXNlcjE1MTI3MTE1",
    "login": "samkit-jain",
    "name": "Samkit Jain",
    "bio": "Developer.",
    "createdAt": "2015-10-14T15:17:26Z",
    "commits": 2172,
    "stars": 6,
    "forks": 0,
    "watchers": 20,
    "languages": [
        {
            "name": "Java",
            "color": "#b07219",
            "commits": 85.85470085470085,
            "repos": 11
        },
        {
            "name": "JavaScript",
            "color": "#f1e05a",
            "commits": 4.444444444444445,
            "repos": 3
        },
        {
            "name": "Python",
            "color": "#3572A5",
            "commits": 4.401709401709402,
            "repos": 9
        },
        {
            "name": "Shell",
            "color": "#89e051",
            "commits": 3.4188034188034186,
            "repos": 2
        },
        {
            "name": "HTML",
            "color": "#e34c26",
            "commits": 1.4957264957264957,
            "repos": 3
        },
        {
            "name": "C++",
            "color": "#f34b7d",
            "commits": 0.21367521367521367,
            "repos": 1
        },
        {
            "name": "CSS",
            "color": "#563d7c",
            "commits": 0.17094017094017094,
            "repos": 1
        }
    ],
    "repos": [
        {
            "full_name": "PhilJay/MPAndroidChart",
            "branch": "master",
            "stars": 19640,
            "watchers": 945,
            "forks": 5474,
            "url": "https://github.com/PhilJay/MPAndroidChart",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 1925,
            "user_commits": 1925
        },
        {
            "full_name": "hereisnaman/gitfame-backend",
            "branch": "master",
            "stars": 2,
            "watchers": 2,
            "forks": 1,
            "url": "https://github.com/hereisnaman/gitfame-backend",
            "languages": [
                {
                    "name": "JavaScript",
                    "color": "#f1e05a"
                },
                {
                    "name": "Shell",
                    "color": "#89e051"
                }
            ],
            "total_commits": 40,
            "user_commits": 40
        },
        {
            "full_name": "hereisnaman/gitfame-backend",
            "branch": "master",
            "stars": 2,
            "watchers": 2,
            "forks": 1,
            "url": "https://github.com/hereisnaman/gitfame-backend",
            "languages": [
                {
                    "name": "JavaScript",
                    "color": "#f1e05a"
                },
                {
                    "name": "Shell",
                    "color": "#89e051"
                }
            ],
            "total_commits": 40,
            "user_commits": 40
        },
        {
            "full_name": "samkit-jain/Handwriting-Recognition",
            "branch": "master",
            "stars": 3,
            "watchers": 2,
            "forks": 0,
            "url": "https://github.com/samkit-jain/Handwriting-Recognition",
            "languages": [
                {
                    "name": "Python",
                    "color": "#3572A5"
                },
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 39,
            "user_commits": 39
        },
        {
            "full_name": "samkit-jain/pwa-imgur",
            "branch": "master",
            "stars": 2,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/pwa-imgur",
            "languages": [
                {
                    "name": "HTML",
                    "color": "#e34c26"
                },
                {
                    "name": "JavaScript",
                    "color": "#f1e05a"
                }
            ],
            "total_commits": 24,
            "user_commits": 24
        },
        {
            "full_name": "samkit-jain/Data-Science-by-Siraj-Raval",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/Data-Science-by-Siraj-Raval",
            "languages": [
                {
                    "name": "Python",
                    "color": "#3572A5"
                }
            ],
            "total_commits": 20,
            "user_commits": 20
        },
        {
            "full_name": "samkit-jain/Textractor",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/Textractor",
            "languages": [
                {
                    "name": "Python",
                    "color": "#3572A5"
                }
            ],
            "total_commits": 11,
            "user_commits": 11
        },
        {
            "full_name": "samkit-jain/Yoda",
            "branch": "master",
            "stars": 1,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/Yoda",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                },
                {
                    "name": "Python",
                    "color": "#3572A5"
                }
            ],
            "total_commits": 10,
            "user_commits": 10
        },
        {
            "full_name": "samkit-jain/Make-Me-Do-It",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/Make-Me-Do-It",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 8,
            "user_commits": 8
        },
        {
            "full_name": "samkit-jain/LinkedIn-Resume-Parser",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/LinkedIn-Resume-Parser",
            "languages": [
                {
                    "name": "Python",
                    "color": "#3572A5"
                }
            ],
            "total_commits": 7,
            "user_commits": 7
        },
        {
            "full_name": "samkit-jain/WiFi-State",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/WiFi-State",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 7,
            "user_commits": 7
        },
        {
            "full_name": "samkit-jain/inkredo-assignment",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/inkredo-assignment",
            "languages": [
                {
                    "name": "Python",
                    "color": "#3572A5"
                },
                {
                    "name": "HTML",
                    "color": "#e34c26"
                }
            ],
            "total_commits": 7,
            "user_commits": 7
        },
        {
            "full_name": "samkit-jain/Motivation-Watch-Face",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/Motivation-Watch-Face",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 5,
            "user_commits": 5
        },
        {
            "full_name": "samkit-jain/USACO-Training",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/USACO-Training",
            "languages": [
                {
                    "name": "C++",
                    "color": "#f34b7d"
                }
            ],
            "total_commits": 5,
            "user_commits": 5
        },
        {
            "full_name": "samkit-jain/TransparentWidget",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/TransparentWidget",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 4,
            "user_commits": 4
        },
        {
            "full_name": "samkit-jain/Contacts-Search-App",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/Contacts-Search-App",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 4,
            "user_commits": 4
        },
        {
            "full_name": "samkit-jain/musique-app",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/musique-app",
            "languages": [
                {
                    "name": "Python",
                    "color": "#3572A5"
                },
                {
                    "name": "CSS",
                    "color": "#563d7c"
                },
                {
                    "name": "HTML",
                    "color": "#e34c26"
                }
            ],
            "total_commits": 4,
            "user_commits": 4
        },
        {
            "full_name": "samkit-jain/CTWapp",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/CTWapp",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 3,
            "user_commits": 3
        },
        {
            "full_name": "samkit-jain/Live-Battery-Wallpaper",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/Live-Battery-Wallpaper",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 3,
            "user_commits": 3
        },
        {
            "full_name": "samkit-jain/musique-api",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/musique-api",
            "languages": [
                {
                    "name": "Python",
                    "color": "#3572A5"
                }
            ],
            "total_commits": 3,
            "user_commits": 3
        },
        {
            "full_name": "samkit-jain/Add-to-cart-on-Snapdeal",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/Add-to-cart-on-Snapdeal",
            "languages": [
                {
                    "name": "Python",
                    "color": "#3572A5"
                }
            ],
            "total_commits": 2,
            "user_commits": 2
        },
        {
            "full_name": "samkit-jain/and-nd-firebase-1.00-starting-point",
            "branch": "master",
            "stars": 0,
            "watchers": 1,
            "forks": 0,
            "url": "https://github.com/samkit-jain/and-nd-firebase-1.00-starting-point",
            "languages": [
                {
                    "name": "Java",
                    "color": "#b07219"
                }
            ],
            "total_commits": 1,
            "user_commits": 1
        }
    ],
    "time": "2017-12-19T14:03:59.168Z",
    "_id": "samkit-jain"
}
```