#!/bin/bash

local_file="./dist/"

remote_user="root"
remote_host="106.14.71.15"
remote_path="/usr/share/nginx/qiayun-admin/dist"

scp -r "$local_file"* "$remote_user@$remote_host:$remote_path"
ssh "$remote_user@$remote_host" "nginx -s reload"