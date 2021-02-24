#!/bin/bash

########################################################################
#	- This is the main script that is used to compile/interpret the source code
#	- The script takes 5 arguments
#		1. The compiler that is to compile the source file.
#		2. The source file that is to be compiled/interpreted
#		3. The desire output file
#		4. The input directory
#       5. The working directory
#
#   - Sample execution command:   $> ./executeOne.sh python /tmp/compile/app.py ./outputFolder/app.out ./inputsFolder/app.inp
#
########################################################################

# Variable
compiler=$1
fileDir=$2
outputDir=$3
inputDir=$4
dir=$5

# Work
exec  1> $dir"logfile.txt"
exec  2> $outputDir

START=$(date +%s.%2N)

if [ "$output" = "" ]; then
    $compiler $fileDir -< $inputDir
	mv $dir"logfile.txt" $outputDir

else
    $compiler $fileDir $inputDir

	if [ $? -eq 0 ];	then
		$output -< $inputDir
		mv $dir"logfile.txt" $outputDir
	else
	    $output -< "Compilation Failed"
		mv $dir"logfile.txt" $outputDir
	fi
fi


END=$(date +%s.%2N)
runtime=$(echo "$END - $START" | bc)

echo "*-------------------------------------------------------------------------*" >> $outputDir
echo "RUN TIME: "$runtime >> $outputDir

