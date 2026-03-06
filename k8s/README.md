# SteamIdler Kubernetes Deployment

## Prerequisites

- A Kubernetes cluster (minikube, k3s, EKS, GKE, etc.)
- `kubectl` configured to connect to your cluster
- The SteamIdler Docker image built and available to your cluster

## Setup

### 1. Build the Docker image

```bash
docker build -t steamidler:latest .
```

If using a remote cluster, push to your container registry:

```bash
docker tag steamidler:latest your-registry/steamidler:latest
docker push your-registry/steamidler:latest
```

Update `k8s/deployment.yaml` to reference your registry image.

### 2. Create the Secret

Edit `k8s/secret.yaml` with your Steam credentials:

```bash
cp k8s/secret.yaml k8s/secret-local.yaml
# Edit k8s/secret-local.yaml with your actual credentials
kubectl apply -f k8s/secret-local.yaml
```

**Never commit real credentials to version control.**

### 3. Create the PersistentVolumeClaim

```bash
kubectl apply -f k8s/pvc.yaml
```

This creates a 100Mi volume for refresh token persistence across pod restarts.

### 4. Deploy

```bash
kubectl apply -f k8s/deployment.yaml
```

### 5. Verify

```bash
kubectl get pods -l app=steamidler
kubectl logs -f deployment/steamidler
```

## Updating

```bash
docker build -t steamidler:latest .
kubectl rollout restart deployment/steamidler
```

## Cleanup

```bash
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/pvc.yaml
kubectl delete secret steamidler-credentials
```
