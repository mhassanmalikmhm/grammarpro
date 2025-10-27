{
  "version": 2,
  "builds": [
    {
      "src": "api/grammar.js",
      "use": "@vercel/node"
    },
    {
      "src": "*.html",
      "use": "@vercel/static"
    },
    {
      "src": "*.css", 
      "use": "@vercel/static"
    },
    {
      "src": "*.js",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/grammar",
      "dest": "/api/grammar.js",
      "methods": ["POST", "OPTIONS"]
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}