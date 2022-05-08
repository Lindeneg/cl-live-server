#!/usr/bin/env bash

CMD='yarn run build'

LARGS=$#

LERNA_SCOPE=''

PREFIX='@cl-live-server/'

BUILD_MSG="BUILDING "

IS_ALL=0

function build_scopes () {
  local SCOPES=()
  for arg in "$@" 
    do
      SCOPES+=( "$PREFIX$arg" )
  done
  local SCOPES_STR="${SCOPES[*]}"
  LERNA_SCOPE="{$(echo $SCOPES_STR} | sed 's/\s/,/g')"
  BUILD_MSG+="$LARGS PACKAGES: $SCOPES_STR"
}

function build_scope () {
  local S="$PREFIX$1"
  LERNA_SCOPE=$S
  BUILD_MSG+="$2: $S"
}

function main () {
  if [[ $LARGS -eq 0 ]]
    then
      IS_ALL=1
      build_scope '*' 'ALL PACKAGES'
  elif [[ $LARGS -eq 1 ]]
    then
      build_scope "$1" '1 PACKAGE'
  else
    build_scopes $@
  fi
}

function build () {
  echo $BUILD_MSG

  result="lerna exec --scope '$LERNA_SCOPE' -- $CMD"

  $result

  CODE=$?

  exit $CODE 
}

main $@

build
