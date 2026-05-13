#!/bin/sh

if [ -z "$SSH_SERVER" ] || [ -z "$SSH_USER" ]; then
    echo "Error: SSH_SERVER or SSH_USER environment variable is not set"
    exit 1
fi

rsync -auvrP -e "ssh -p $SSH_PORT" functions/* $SSH_USER@$SSH_SERVER:~/supabase/docker/volumes/functions