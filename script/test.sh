#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -eo pipefail

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the GSN relay server that we started (if we started one and if it's still running).
  if [ -n "$gsn_relay_server_pid" ] && ps -p $gsn_relay_server_pid > /dev/null; then
    kill $gsn_relay_server_pid
  fi

  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}


ganache_port=8545
ganache_url="http://localhost:$ganache_port"

relayer_port=8090
relayer_url="http://localhost:${relayer_port}"

ganache_running() {
  nc -z localhost "$ganache_port"
}

relayer_running() {
  nc -z localhost "$relayer_port"
}

start_ganache() {
  npx ganache-cli --port "$ganache_port" -g 20000000000 -d --noVMErrorsOnRPCResponse &> /dev/null &
  ganache_pid=$!

  echo "Waiting for ganache to launch on port "$ganache_port"..."

  while ! ganache_running; do
    sleep 0.1 # wait for 1/10 of the second before check again
  done

  echo "Ganache launched!"
}

#--detach --quiet
setup_gsn_relay() {
  echo "Launching GSN relay server"
  gsn_relay_server_pid=$(npx oz-gsn run-relayer --ethereumNodeURL $ganache_url --port $relayer_port --detach --quiet)

  echo "GSN relay server launched!"
}

# Main
if ganache_running; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"
  start_ganache
fi

setup_gsn_relay

env PROVIDER_URL=$ganache_url RELAYER_URL=$relayer_url ./node_modules/.bin/truffle test $@