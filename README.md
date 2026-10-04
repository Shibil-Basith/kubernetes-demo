# ShopLite — Kubernetes Microservices Demo

A beginner-friendly 3-tier application for demonstrating how Kubernetes runs a small microservice-style application.

## Architecture

User → Ingress → Frontend → Backend API → MySQL

Components:
- Frontend: React-style single-page UI served by Nginx
- Backend: Node.js + Express REST API
- Database: MySQL 8.0
- Kubernetes: Ingress, Deployments, Services, StatefulSet, Secret, ConfigMap, PVC

## Docker Hub images

- `shibilbasith11/shoplite-frontend:1.0`
- `shibilbasith11/shoplite-backend:1.0`

MySQL uses the official `mysql:8.0` image.

## Build and push

```bash
docker build -t shibilbasith11/shoplite-frontend:1.0 ./frontend
docker build -t shibilbasith11/shoplite-backend:1.0 ./backend

docker login
docker push shibilbasith11/shoplite-frontend:1.0
docker push shibilbasith11/shoplite-backend:1.0
```

## Deploy

```bash
kubectl apply -f kubernetes/
kubectl get pods
kubectl get svc
kubectl get ingress
```

The Ingress hostname depends on your Kubernetes environment. With Minikube:

```bash
minikube addons enable ingress
minikube ip
```

Add the appropriate hostname to `/etc/hosts`, for example:

```text
<MINIKUBE-IP> shoplite.local
```

Then open:

```text
http://shoplite.local
```

## Communication

Frontend calls:

```text
http://backend-service:3000
```

Backend connects to:

```text
mysql-service:3306
```

The Kubernetes Services provide stable DNS names even when Pods are recreated.
