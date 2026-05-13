FROM node:22

RUN apt update
RUN apt install -y sudo git-lfs
RUN corepack install -g pnpm@latest
RUN corepack enable pnpm

RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN mkdir /workspace
WORKDIR /workspace
USER node


EXPOSE 3000-3050
CMD ["sleep", "infinity"]