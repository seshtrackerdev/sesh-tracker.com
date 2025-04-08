# Mutual TLS Setup Guide for Cloudflare OpenAuth Implementation

Securing communication between Sesh-Tracker.com and Kush.Observer requires proper TLS configuration. This guide outlines the steps for implementing mutual TLS (mTLS) authentication for production environments using Cloudflare Workers.

## What is Mutual TLS?

Mutual TLS extends standard TLS by requiring both the client and server to present certificates to each other. This provides stronger security by ensuring both parties are authenticated, not just the server.

## Prerequisites

- Access to Cloudflare dashboard for both domains
- Cloudflare for SSL management
- OpenSSL or similar tool for certificate generation
- Certificate Authority (CA) for signing certificates

## Cloudflare Workers and Mutual TLS

Cloudflare Workers can utilize mutual TLS for secure server-to-server communication. This guide will show you how to set this up.

### 1. Generate Certificate Authority (if needed)

```bash
# Generate CA private key
openssl genrsa -out kushsesh-ca.key 4096

# Generate CA certificate
openssl req -new -x509 -key kushsesh-ca.key -out kushsesh-ca.crt -days 365 -subj "/CN=Kush-Sesh Integration CA"
```

### 2. Generate Sesh-Tracker Client Certificate

```bash
# Generate private key
openssl genrsa -out seshtracker-client.key 2048

# Generate Certificate Signing Request (CSR)
openssl req -new -key seshtracker-client.key -out seshtracker-client.csr -subj "/CN=sesh-tracker.com"

# Generate client certificate signed by CA
openssl x509 -req -in seshtracker-client.csr -CA kushsesh-ca.crt -CAkey kushsesh-ca.key -CAcreateserial -out seshtracker-client.crt -days 365
```

### 3. Generate Kush.Observer Server Certificate

```bash
# Generate private key
openssl genrsa -out kushobserver-server.key 2048

# Generate Certificate Signing Request (CSR)
openssl req -new -key kushobserver-server.key -out kushobserver-server.csr -subj "/CN=kush.observer"

# Generate server certificate signed by CA
openssl x509 -req -in kushobserver-server.csr -CA kushsesh-ca.crt -CAkey kushsesh-ca.key -CAcreateserial -out kushobserver-server.crt -days 365
```

## Cloudflare Configuration for Kush.Observer

### API Shield Configuration in Cloudflare Dashboard

1. Log in to your Cloudflare dashboard
2. Select the "kush.observer" domain
3. Navigate to "Security" > "API Shield"
4. Enable "Mutual TLS"
5. Upload the CA certificate (kushsesh-ca.crt)
6. Create a new API Shield rule:
   - Name: "Require mTLS for API endpoints"
   - Expression: `(http.request.uri.path contains "/api/") and not cf.tls_client_auth.cert_verified`
   - Action: Block

### Cloudflare Worker Configuration for Kush.Observer

```javascript
// Example middleware to validate client certificates
app.use('/api/*', async (c, next) => {
  // Check if we have a client certificate
  const clientCertVerified = c.req.cf && c.req.cf.tlsClientAuth && c.req.cf.tlsClientAuth.certVerified;
  
  if (!clientCertVerified) {
    return c.json({
      error: 'Mutual TLS authentication required',
      code: 'MTLS_REQUIRED'
    }, 403);
  }
  
  // Add client cert info to the request context
  c.set('clientCertInfo', {
    certIssuerDN: c.req.cf.tlsClientAuth.certIssuerDN,
    certSubjectDN: c.req.cf.tlsClientAuth.certSubjectDN,
    certFingerprintSHA1: c.req.cf.tlsClientAuth.certFingerprintSHA1
  });
  
  await next();
});
```

## Configuration for Sesh-Tracker.com (Cloudflare Worker)

### Cloudflare SSL/TLS API Configuration

1. In the Cloudflare dashboard, go to SSL/TLS → Client Certificates
2. Generate a new client certificate or upload the one created earlier (seshtracker-client.crt)
3. Add the certificate to the Cloudflare certificate management
4. Copy the certificate ID for use in your Cloudflare Worker

### Cloudflare Worker Configuration

When connecting to Kush.Observer's API with mTLS:

```javascript
// Example Worker code to connect to Kush.Observer with mTLS
async function connectToKushObserver(endpoint, data) {
  try {
    const response = await fetch(`https://kush.observer/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cf: {
        // Reference to the certificate stored in Cloudflare
        clientCertificate: {
          certificateId: env.KUSH_MTLS_CERT_ID
        }
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('mTLS connection error:', error);
    throw error;
  }
}
```

## Adding Certificate ID to Worker Secrets

Store the certificate ID securely using Cloudflare Worker Secrets:

```bash
# Store certificate ID as a secret
npx wrangler secret put KUSH_MTLS_CERT_ID
# Enter the certificate ID when prompted
```

Then reference it in your worker:

```javascript
// In your worker code
export default {
  async fetch(request, env, ctx) {
    // Use the certificate ID from environment
    const certId = env.KUSH_MTLS_CERT_ID;
    
    // ...rest of your code
  }
};
```

## Testing mTLS Configuration

### Validate Server Certificate

```bash
# Check server certificate
curl -v https://kush.observer/api/health
```

### Test Client Certificate Authentication

```bash
# Test with client certificate
curl --cert seshtracker-client.crt --key seshtracker-client.key https://kush.observer/api/auth/verify
```

### Verify API Access with Worker

Create a test endpoint in your worker to verify mTLS connection:

```javascript
// Add a test route handler
app.get('/test/mtls-connection', async (c) => {
  try {
    const response = await fetch('https://kush.observer/api/health', {
      cf: {
        clientCertificate: {
          certificateId: c.env.KUSH_MTLS_CERT_ID
        }
      }
    });
    
    if (response.ok) {
      return c.json({ success: true, message: 'mTLS connection successful' });
    } else {
      return c.json({ 
        success: false, 
        status: response.status,
        message: await response.text()
      });
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

## Security Considerations

1. **Certificate Management in Cloudflare:** Utilize Cloudflare's certificate management system for secure storage
2. **Certificate Rotation:** Schedule quarterly rotation via Cloudflare's dashboard
3. **Certificate Revocation:** Implement immediate revocation process in Cloudflare if compromised
4. **Monitoring:** Set up Cloudflare alerts for certificate-related issues

## Cloudflare-Specific Troubleshooting

- **Certificate Upload Issues:** Ensure certificates are in the correct format (PEM)
- **API Shield Rules:** Verify rule expressions are targeting the correct paths
- **Worker Certificate Binding:** Confirm the certificate ID is correctly referenced in the fetch options
- **Developer Mode:** Test in development mode with `wrangler dev` using the same certificate configuration

## Production Deployment Checklist

- [ ] Generate separate certificates for development, staging, and production environments
- [ ] Configure proper Cloudflare API Shield rules for each environment
- [ ] Store certificate IDs in Worker Secrets
- [ ] Test mTLS connections from each environment
- [ ] Set up Cloudflare notification alerts for certificate expiration
- [ ] Document emergency certificate rotation procedure

For additional assistance, refer to Cloudflare's documentation on [API Shield and mTLS](https://developers.cloudflare.com/api-shield/security/mtls/). 