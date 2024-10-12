# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in subcontracting/__init__.py
from subcontracting import __version__ as version

setup(
	name='subcontracting',
	version=version,
	description='App for subcontracting.',
	author='Unilink Enterprise',
	author_email='erp@unilinkenterprise.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
