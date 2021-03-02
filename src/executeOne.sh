#!/bin/bash

# Variable
outputDir=$1
inputDir=$2
dir=$3
compiler=$4
optionalFile=$5

# Work
cd $dir
exec  1> "logfile.txt"
exec  2> "logfile.txt"

START=$(date +%s.%2N)

if [ "$output" = "" ]; then
    $compiler $optionalFile -< $inputDir
else
    $compiler $optionalFile $inputDir
fi

mv "logfile.txt" $outputDir

END=$(date +%s.%2N)

runtime=$(echo "$END - $START" | bc)

echo $runtime >> $outputDir

