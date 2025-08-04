# Deployment Guide

This guide covers how to deploy AdjustMeeting to various platforms.

## 🚀 Quick Deploy Options

### Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/adjustmeeting)

1. **Fork this repository**
2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your forked repository

3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live in minutes

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/adjustmeeting)

1. **Import project**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure**
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Deploy**
   - Click "Deploy"
   - Your site will be live instantly

### GitHub Pages

1. **Enable GitHub Pages**
   ```bash
   # Install gh-pages
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

## 🔧 Manual Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Preview the build (optional)
npm run preview
```

### Static File Hosting

The `dist` folder contains all static files needed for deployment:

- Upload the entire `dist` folder to your web server
- Ensure your server supports SPA routing (see routing section)

## 🌐 Custom Domain Setup

### Netlify Custom Domain

1. **Add domain in Netlify dashboard**
   - Go to Site settings > Domain management
   - Add custom domain

2. **Configure DNS**
   - Add CNAME record pointing to your Netlify subdomain
   - Or use Netlify DNS for full management

### Vercel Custom Domain

1. **Add domain in Vercel dashboard**
   - Go to Project settings > Domains
   - Add your custom domain

2. **Configure DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`

## 🔄 SPA Routing Configuration

Since AdjustMeeting is a Single Page Application, you need to configure your server to handle client-side routing.

### Netlify
Already configured with `public/_redirects`:
```
/*    /index.html   200
```

### Apache (.htaccess)
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Express.js
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
```

## 🔒 HTTPS Requirements

AdjustMeeting requires HTTPS for:
- Camera and microphone access
- Screen sharing functionality
- WebRTC connections

Most deployment platforms (Netlify, Vercel) provide HTTPS automatically.

## 🌍 Environment Variables

For production deployments, you may want to configure:

```env
VITE_APP_NAME=AdjustMeeting
VITE_DEFAULT_ROOM_PREFIX=meeting-
VITE_MAX_PARTICIPANTS=10
```

## 📊 Performance Optimization

### Build Optimization
- Code splitting is already configured
- Assets are minified and compressed
- Vendor chunks are separated for better caching

### CDN Configuration
Most platforms provide CDN automatically, but you can also:
- Use Cloudflare for additional performance
- Configure custom caching headers
- Enable Brotli compression

## 🔍 Monitoring and Analytics

### Error Tracking
Consider adding error tracking:
- Sentry for error monitoring
- LogRocket for session replay
- Google Analytics for usage tracking

### Performance Monitoring
- Lighthouse CI for performance testing
- Web Vitals monitoring
- Real User Monitoring (RUM)

## 🚨 Troubleshooting

### Common Issues

**Build fails with memory error:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Routes not working after deployment:**
- Ensure SPA routing is configured
- Check that `_redirects` file is in the build output

**Camera/microphone not working:**
- Ensure site is served over HTTPS
- Check browser permissions
- Verify WebRTC support

**Screen sharing not working:**
- HTTPS is required
- Check browser compatibility
- Verify getDisplayMedia API support

### Debug Mode

For debugging production issues:

```bash
# Build with source maps
npm run build -- --sourcemap

# Run with debug logging
VITE_DEBUG=true npm run build
```

## 🔄 Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

### Automatic Deployments

Most platforms support automatic deployments:
- **Netlify**: Automatically deploys on git push
- **Vercel**: Deploys on every commit to main branch
- **GitHub Pages**: Can be configured with GitHub Actions

## 📱 Mobile Considerations

- PWA capabilities are built-in
- Responsive design works on all devices
- Touch-friendly interface
- Optimized for mobile browsers

## 🌐 Global Deployment

For global users:
- Use CDN for faster loading
- Consider multiple deployment regions
- Optimize for different network conditions
- Test across different browsers and devices

## 📈 Scaling Considerations

While AdjustMeeting is peer-to-peer:
- Consider TURN servers for better connectivity
- Monitor bandwidth usage
- Plan for concurrent user limits
- Consider signaling server scaling

---

For more deployment options or custom setups, please check our [GitHub Discussions](https://github.com/yourusername/adjustmeeting/discussions) or open an issue.