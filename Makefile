# **************************************************************************** #
#                                                                              #
#                                                         ::::::::             #
#    Makefile                                           :+:    :+:             #
#                                                      +:+                     #
#    By: nnarimatsu <nnarimatsu@student.codam.nl      +#+                      #
#                                                    +#+                       #
#    Created: 2025/09/01 12:34:28 by nnarimatsu    #+#    #+#                  #
#    Updated: 2025/09/11 15:51:12 by nnarimatsu    ########   odam.nl          #
#                                                                              #
# **************************************************************************** #

all: up

up:
	@echo "===  Creates and starts containers from images, create network, and volumes ==="
	docker compose -f docker-compose.yml up -d --build

down:
	@echo "=== Stops and removes the containers and the project network ==="
	docker compose -f docker-compose.yml down

stop:
	@echo "=== stops containers but keeps them ==="
	docker compose -f docker-compose.yml stop

restart:
	@echo "=== stop + start on the same containers. ==="
	docker compose -f docker-compose.yml restart

logs:
	docker compose -f docker-compose.yml logs -f

ps:
	docker compose -f docker-compose.yml ps

prune: down
	@echo "=== Pruning Docker system (removing stopped containers, unused networks, build cache) ==="
	docker system prune -f

prune-all:
	@echo "!!! WARNING: This will remove everything, including database volumes !!!"
	docker compose -f docker-compose.yml down --volumes
	docker system prune -af
help:
	@echo "make (or make up)  - Create & start containers (build if needed); sets up network/volumes"
	@echo "make down          - Stop and remove containers and the Compose network (keeps named volumes)"
	@echo "make stop          - Stop containers without removing them"
	@echo "make restart       - Stop + start the same containers (no rebuild/recreate)"
	@echo "make logs          - Follow logs for all services"
	@echo "make ps            - Show service status and mapped ports"

.PHONY: help up down stop restart  logs ps