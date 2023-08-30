#!/bin/bash

echo -n "Do you want to run $*? [N/y] "
read -N 1 REPLY
echo
if test "$REPLY" = "y" -o "$REPLY" = "Y"; then
  echo "Building $*..."
  NODE_OPTIONS='--max-old-space-size=8192' tsc --outDir dist_prod
else
  echo "Cancelled by user"
fi
