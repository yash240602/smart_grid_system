from setuptools import setup, find_packages

setup(
    name="smart_grid_system",
    version="1.0.0",
    description="Smart Grid Optimization System for Electrical Engineering students",
    author="Your Name",
    author_email="your.email@example.com",
    packages=find_packages(),
    install_requires=[
        "numpy>=1.24.0",
        "tensorflow>=2.15.0",
        "scikit-learn>=1.3.0",
        "fastapi>=0.104.0",
        "uvicorn>=0.23.0",
        "pydantic>=2.4.0",
        "matplotlib>=3.8.0",
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Education",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: C++",
        "Topic :: Scientific/Engineering :: Physics",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.9",
) 