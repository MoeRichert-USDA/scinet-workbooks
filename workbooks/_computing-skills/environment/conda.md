---
title: Managing packages and environments with Anaconda
type: interactive tutorial
order: 20
---



If all of the software components you need to manage in your virtual environment are Python packages, we strongly recommend using the [`venv` and `pip` workflow](./python).

However, if you need to manage other kinds of software, too, `conda` can provide a useful alternative. Conceptually, the process of managing software using `conda` is the same: you create a virtual environment and then manage software packages within that environment. We will go over the basics in this tutorial; please see [the official documentation](https://conda.io/projects/conda/en/latest/user-guide/index.html) for more information!

## Load and initialize miniconda

First, load the environment module for miniconda so that you have access to the `conda` command:
* On Ceres: `module load miniconda` or `ml load miniconda`.
* On Atlas: `module load miniconda3` or `ml load miniconda3`.

If you've not used `conda` before on the system, you will need to run `conda init`. By default, this will cause the conda "base" environment to automatically be activated every time you log in. This can be annoying! If you want to disable this, run `conda config --set auto_activate_base false`. (You can also undo _all_ changes made by `conda init` by running `conda init --reverse`.) After running `conda init` for the first time, you will need to either exit your shell session and start a new one or run `source ~/.basrc`.

{% include alert class="note" content="`mamba` is a drop-in replacement for `conda` that is generally faster and more robust. However, recent versions of `conda` have adopted code from the `mamba` project so that there is now less of a performance gap between the two. If `mamba` is available (`mamba` is currently available on Ceres but not on Atlas), you can simply replace `conda` with `mamba` in the commands below." %}

**An important note about conda channels:** `conda` installs software from a "channel", which is essentially a remote software repository. By default, `conda` attempts to install software from a channel called "defaults". However, use of the "defaults" channel requires a paid license, so USDA employees should _not_ install software from "defaults"! Instead, we recommend you use the "conda-forge" channel, which is free to use. To see which channel(s) you are using, run `conda config --show channels`. If you see "defaults" listed, complete the following steps:

1. Run `conda config --add channels conda-forge` to add the "conda-forge" channel.
1. Run `conda config --remove channels defaults` to remove the "defaults" channel.

## Creating and managing environments with `conda`

First, let's cover what _not_ to do! Most online documentation will tell you to create a new conda environment by running `conda create -n ENVNAME`, where "ENVNAME" is the name of the new environment. E.g., `conda create -n conda_env`. The problem with this is that all packages will be installed into a hidden directory inside your home directory (typically `~/.conda/envs`) and you will quickly run out of space!

Instead, we need to tell `conda` to create the environment in a location that we choose. Proceed as follows:

1. Run `conda create --prefix ENVNAME`, where "ENVNAME" is the name of the new environment. E.g., `conda create --prefix conda_env`. This will create a directory called "ENVNAME" for the new environment.
1. Activate the environment by running `conda activate /path/to/ENVNAME`, where "path/to/ENVNAME" is the file system path to the environment location. E.g., `conda activate ./conda_env`.
1. To deactivate the environment and return to the "normal" command environment you had before, run `conda deactivate`.
1. To remove the environment, delete its directory: e.g., `rm -I -r conda_venv`. Alternatively, you can run the command `conda remove --prefix /path/to/ENVNAME --all`.

## Installing and managing software in a conda environment

The `conda` command is also used to install and remove software from a conda environment.

1. Make sure the target conda environment is activated.
1. Run `conda install PACKAGE` to install software into a conda environment.
1. Run `conda remove PACKAGE` to uninstall software.

Note that a conda environment does not automatically include Python, so you will need to tell `conda` to install it!

> **Exercise 5:** If you have not already done so, create a new conda environment called `conda_env`. Activate the environment and launch Python (`python`). The most recent version of Python available from the `conda-forge` channel is 3.12.6. What do you notice? Use `conda` to install the latest version of Python from `conda-forge` into your conda environment and verify that it works.

Conda provides an alternative way to manage Python packages. Although you can still use `pip` from within a conda environment, doing so can introduce a variety of complications, and the [official recommendation](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-pkgs.html#installing-non-conda-packages) is to use `conda` to manage Python packages within a conda environment whenever possible.

> **Exercise 6:** Modify your conda environment so that you can run the Python script you created for Exercise 1.

## Automate package management with environment.yml 

Just as we can use [requirements.txt](./python#automate-package-management-with-requirementstxt) to specify the packages to include in a Python virtual environment, we can use a file typically called "environment.yml" to specify the packages to include in a conda environment.

To automatically generate the contents of `environment.yml` for an activated conda environment, run `conda export --from-history`. To save the output directly to a file, run `conda export --from-history > environment.yml`.

To create a new conda environment that matches the contents of an environment file, run `conda env create --prefix ENVNAME --file environment.yml`, where "ENVNAME" is the name of the new environment. E.g., `conda env create --prefix conda_env --file environment.yml`.

> **Exercise 7:** Save the configuration of the conda environment you created for Exercise 6 and use it to create a new conda environment. Verify that you have the correct version of Python in the new environment and are able to run the Python script you created for Exercise 1.

## Using conda environments with Jupyter notebooks

The process to make a conda environment available to Jupyter notebooks is nearly the same as for Python virtual environments.

1. Make sure the target conda virtual environment for the kernel is activated.
1. Install the `ipykernel` package: `conda install ipykernel`.
1. Create a "kernel specification" that will make the virtual environment available to Jupyter notebooks: `python -m ipykernel install --user --name "KERNEL NAME"`.

You should now see your new kernel available for use with Jupyter notebooks. (It might take a minute or two for Jupyter to detect the new kernel.)

> **Exercise 8:** Create a new conda environment, install Python into it, and create a Jupyter kernel for the environment. Modify the environment so that you can use the kernel to run the code from Exercise 4 in a Jupyter notebook.
