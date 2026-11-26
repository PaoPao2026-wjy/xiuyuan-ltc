#!/bin/bash

local_file="./dist/"

remote_user="root"
remote_host="101.132.251.43"
remote_path="/usr/share/nginx/qiayun-admin/dist"

scp -r "$local_file"* "$remote_user@$remote_host:$remote_path"
ssh "$remote_user@$remote_host" "nginx -s reload"