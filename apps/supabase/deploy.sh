#!/bin/sh

FOLDER=$HOME/supabase
REPO=https://github.com/supabase/supabase.git
TAG=1.24.08


if [ ! -d "$FOLDER" ]; then
    echo "Cloning Supabase repository..."
    git clone $REPO $FOLDER
fi

cd $FOLDER
CURRENT_TAG=$(git describe --tags 2>/dev/null)

if [ "$CURRENT_TAG" != "$TAG" ]; then
    echo "Updating Supabase to tag $TAG..."
    git fetch --all
    git checkout $TAG
fi

if [ -f "docker.diff" ]; then
    echo "Applying docker.diff..."
    git apply docker.diff
fi

cd docker
docker compose up -d