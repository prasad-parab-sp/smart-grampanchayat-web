# Deploy smart-grampanchayat-web to AWS (ECS + ALB)

The Angular app is built into an **nginx** image (`Dockerfile`). The production bundle calls the API at:

`http://smart-grampanchayat-api-alb-1209278946.ap-south-1.elb.amazonaws.com`

(see `src/environments/api-url.ts`).

## Recommended layout: one ALB, path-based routing

| ALB rule (priority) | Path | Target group | Container port |
|---------------------|------|--------------|------------------|
| 1 | `/api/*` | API (existing) | 8080 |
| 2 | `/actuator/*` | API | 8080 |
| 3 | `/swagger-ui*`, `/v3/api-docs*` | API | 8080 |
| Default | `/*` | **Web** (new) | 80 |

Users open the **ALB DNS** in the browser → nginx serves the SPA; the app calls `/api/...` on the **same host** (configured `apiBaseUrl` is the full ALB URL).

---

## 1. Build and push the image

```bash
cd smart-grampanchayat-web
export AWS_PROFILE=grampanchayat
export AWS_REGION=ap-south-1
export ACCOUNT_ID=551216219543
export ECR_REPO=smart-grampanchayat-web

aws ecr create-repository --repository-name "$ECR_REPO" --region "$AWS_REGION" 2>/dev/null || true

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

docker build --platform linux/amd64 -t "$ECR_REPO:latest" .
docker tag "$ECR_REPO:latest" "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest"
docker push "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest"
```

---

## 2. ECS task definition (web)

Create a task definition similar to the API, with:

| Field | Value |
|-------|--------|
| Image | `551216219543.dkr.ecr.ap-south-1.amazonaws.com/smart-grampanchayat-web:latest` |
| Port | **80** (container) |
| CPU / memory | e.g. 256 / 512 |
| Network | **awsvpc**, same VPC/subnets as API |
| Security group | New **web** SG: inbound **80** from **ALB security group** only |

No DB secrets required for the web container.

---

## 3. Target group + service

1. **EC2 → Target groups → Create**
   - Type: IP (Fargate)
   - Port: **80**
   - Health check path: `/` (expect 200)
   - Healthy threshold: 2 (optional; lower than 5 for faster rollout)

2. **ECS → Cluster** (same as API) → **Create service**
   - Launch type: Fargate
   - Task definition: web
   - Desired count: 1
   - Load balancer: attach to **existing ALB**
   - Listener: **HTTP:80**
   - Target group: web TG, container **smart-grampanchayat-web 80:80**

3. **EC2 → Load balancers → your ALB → Listeners → HTTP:80 → Manage rules**
   - Add path rules for `/api/*` and `/actuator/*` → **API** target group (must be **before** the default rule).
   - Set **default** action → **web** target group.

4. **API ECS security group**: keep **8080** from ALB SG (unchanged).

5. **Redeploy API** after updating `application-prod.properties` CORS (new deploy of API image if you changed `SecurityConfig`).

---

## 4. Verify

```bash
# SPA
curl -sI "http://smart-grampanchayat-api-alb-1209278946.ap-south-1.elb.amazonaws.com/"

# API health (via ALB)
curl -s "http://smart-grampanchayat-api-alb-1209278946.ap-south-1.elb.amazonaws.com/actuator/health"
```

Open the ALB URL in a browser and log in.

---

## Alternative: separate ALB for the web app

If the API listener must stay “default → API only” for now:

1. Create a **second ALB** for the web (HTTP 80 → web TG).
2. Build with the same `API_BASE_URL` (API ALB URL).
3. Set on the **API** task/env:  
   `APP_CORS_ALLOWED_ORIGINS=http://<web-alb-dns>,http://localhost:4200`

---

## Local dev (unchanged)

`environment.ts` still uses `http://localhost:8080`. Run API on 8080 and `npm start` on 4200.
