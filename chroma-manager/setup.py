#!/usr/bin/env python
#
# ========================================================
# Copyright (c) 2012 Whamcloud, Inc.  All rights reserved.
# ========================================================


from setuptools import setup, find_packages
from production_version import VERSION

excludes = ["*docs*"]

setup(
    name = 'chroma-manager',
    version = VERSION,
    author = "Whamcloud, Inc.",
    author_email = "info@whamcloud.com",
    url = 'http://www.whamcloud.com/',
    license = 'Proprietary',
    description = 'The Whamcloud Lustre Monitoring and Adminisration Interface',
    long_description = open('README.txt').read(),
    packages = find_packages(exclude=excludes) + [''],
    # include_package_data would be far more convenient, but the top-level
    # package confuses setuptools. As a ridiculous hackaround, we'll game
    # things by prepending a dot to top-level datafiles (which implies
    # file creation/cleanup in the Makefile) to deal with the fact
    # that setuptools wants to strip the first character off the filename.
    package_data = {
        '': [".chroma-manager.wsgi"],
        'chroma_ui': ["static/js/lib/*.js", "static/js/*.js", "static/css/smoothness/images/*",
                      "static/css/smoothness/*.css", "static/css/images/*", "static/css/*.css",
                      "static/images/fugue/*.png",
                      "static/images/datatables/*.png", "static/images/datatables/*.jpg",
                      "static/images/breadcrumb/*.gif", "static/images/breadcrumb/COPYING",
                      "static/images/*.ico", "static/images/*.png",
                      "static/images/*.gif", "templates/*"],
        'chroma_help': ["static/contextual/*.html", "static/webhelp/*.html"],
        'polymorphic': ["COPYING"],
        'tests': ["integration/run_tests", "integration/*/*.json", "sample_data/*"],
        'r3d': ["tests/sample_data/*"],
    },
    scripts = ["chroma_core/bin/storage_daemon", "chroma_core/bin/chroma-config", "chroma-host-discover"],
    entry_points = {
        'console_scripts': [
            'chroma = chroma_cli.main:standard_cli',
            'chroma-api = chroma_cli.main:api_cli',
            'qr3d = r3d.cli:main'
        ]
    }
)
