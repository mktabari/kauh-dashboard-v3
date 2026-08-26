# --- Stage 1: Build the application ---
FROM node:24-slim AS builder

WORKDIR /tmp
RUN apt-get update && apt-get install -y \
    alien \
    libaio1 \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*
ADD oracle-instantclient*.rpm /tmp/
RUN alien -i --scripts oracle-instantclient*.rpm 
RUN rm -f oracle-instantclient*.rpm && apt-get -y autoremove && apt-get -y clean
WORKDIR /usr/lib/oracle/11.2/client64/lib/
RUN rm -rf *jdbc* *occi* *mysql* *jar
RUN echo /usr/lib/oracle/11.2/client64/lib > /etc/ld.so.conf.d/oracle-instantclient11.2.conf && ldconfig


WORKDIR /app

# Enable corepack to automatically use the correct pnpm version
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Copy lockfile and package manifest first to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./

# RUN THE INSTALLATION BYPASSING POLICIES VIA ENVIRONMENT VARIABLES
RUN pnpm install --frozen-lockfile


# Copy the rest of the application source code
COPY . .

# Build the SvelteKit application
RUN pnpm build

# Prune devDependencies to keep production image light
RUN pnpm prune --prod

# CMD ["node", "build/index.js"]
# --- Stage 2: Run the application ---
FROM node:24-slim AS runner

COPY --from=0  /usr/lib/oracle /usr/lib/oracle
COPY --from=0  /etc/ld.so.conf.d/oracle-instantclient11.2.conf /etc/ld.so.conf.d/oracle-instantclient11.2.conf

RUN apt-get update 
RUN apt-get -y upgrade 
RUN apt-get -y dist-upgrade
RUN apt-get install -y libaio1 iputils-ping
RUN ldconfig

WORKDIR /app

RUN npm install pm2 -g

COPY pm2.config.cjs ./

# # Copy production artifacts from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts
# COPY sqliteDB/dev.sqlite /app/sqliteDB/dev.sqlite

# # Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=3000

# # Expose the application port
EXPOSE 3000

# # Start the application using Node directly
# CMD ["node", "build/index.js"]
CMD ["pm2-runtime", "pm2.config.cjs"]



# docker build . -t kauhdb:v3.0
# docker run -d -p 3000:3000  --name kauhdb3 --mount source=kd-sqlite-db,target=/app/sqliteDB -e ADDRESS_HEADER=x-forwarded-for -e XFF_DEPTH=1 kauhdb:v3.0
# docker run -d -p 3000:3000  --name kauhdb3 --mount source=kd-sqlite-db,target=/app/sqliteDB --add-host=host.docker.internal:host-gateway kauhdb:v3.0
# docker save -o C:\docker_image_tars\kauhdb_v3.0.tar kauhdb:v3.0
# docker load -i kauhdb_v3.0.tar
# docker volume create --name kd-sqlite-db3 --opt type=none --opt device=/docker_volumes/sqliteDB3 --opt o=bind
# docker run -d -p 3030:3000  --name kauhdb3 --mount source=kd-sqlite-db3,target=/app/sqliteDB -e NODE_NO_WARNINGS=1 -e ADDRESS_HEADER=x-forwarded-for -e XFF_DEPTH=1 kauhdb:v3.0


# docker volume create --driver local --opt type=none --opt o=bind --opt device=/docker_volumes/sqliteDB3 kd-sqlite-db3