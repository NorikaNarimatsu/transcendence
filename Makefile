# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nnarimat <nnarimat@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/08/18 15:32:10 by nnarimat          #+#    #+#              #
#    Updated: 2025/08/18 16:11:10 by nnarimat         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FRONTEND_DIR := frontend
BACKEND_DIR  := backend

FRONTEND_IMG := pong-frontend-dev
BACKEND_IMG  := pong-backend-dev

FRONTEND_CONT := frontend
BACKEND_CONT  := backend

FRONTEND_PORT := 5173
BACKEND_PORT  := 8443

NET := transcendence_network

.PHONY: help
help:
	@echo "make net       - create docker network '$(NET)' if missing"
	@echo "make build     - build frontend & backend dev images"
	@echo "make up        - run both containers (maps $(FRONTEND_PORT) & $(BACKEND_PORT))"
	@echo "make down      - stop & remove both containers"
	@echo "make logs      - tail logs from both"
	@echo "make ps        - show container status"
	@echo "make rebuild   - rebuild images without cache"

# Create a shared bridge network once (frontend can talk to backend later if needed)
net:
	@docker network inspect $(NET) >/dev/null 2>&1 || docker network create $(NET)

build:
	docker build -t $(BACKEND_IMG)  -f $(BACKEND_DIR)/Dockerfile.dev  $(BACKEND_DIR)
	docker build -t $(FRONTEND_IMG) -f $(FRONTEND_DIR)/Dockerfile.dev $(FRONTEND_DIR)

rebuild:
	docker build --no-cache -t $(BACKEND_IMG)  -f $(BACKEND_DIR)/Dockerfile.dev  $(BACKEND_DIR)
	docker build --no-cache -t $(FRONTEND_IMG) -f $(FRONTEND_DIR)/Dockerfile.dev $(FRONTEND_DIR)

up: net
	-@docker rm -f $(BACKEND_CONT) 2>/dev/null || true
	-@docker rm -f $(FRONTEND_CONT) 2>/dev/null || true
	docker run -d --name $(BACKEND_CONT)  --network $(NET) -p $(BACKEND_PORT):$(BACKEND_PORT)  $(BACKEND_IMG)
	docker run -d --name $(FRONTEND_CONT) --network $(NET) -p $(FRONTEND_PORT):$(FRONTEND_PORT) $(FRONTEND_IMG)

down:
	-@docker rm -f $(FRONTEND_CONT) 2>/dev/null || true
	-@docker rm -f $(BACKEND_CONT)  2>/dev/null || true

logs:
	-@docker logs -f $(BACKEND_CONT) & docker logs -f $(FRONTEND_CONT)

ps:
	@docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

.PHONY: net build rebuild up down logs ps
