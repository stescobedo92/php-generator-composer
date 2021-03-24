import yosay from "yosay";
import util from "util";
import fs from "fs";
import yeoman from "yeoman-generator";
import chalk from "chalk";

var exec = require('child_process').exec;

var PhpGeneratorComposer = yeoman.generators.Base.extend({
    init: function() {
        // Have Yeoman greet the user.
        this.log(yosay('Welcome to the PHP Composer Framework generator!'));
    },
    askFor: function () {
        var done = this.async();

        var dependencies = [];

        var prompts = [{
            name: "projectName",
            message: "Project Name",
            validate: function(input) {
                if (!/^[a-zA-Z\-0-9_]+$/.exec(input)) {
                    return "Invalid Directory Name!";
                }
                if (fs.existsSync('./' + input)) {
                    return "Directory already exists!";
                }

                return true;
            }
        },
            {
                type: 'list',
                name: 'skeleton',
                message: 'Which framework would you like to use?',
                choices: [
                    "zendframework/skeleton-application",
                    "symfony/symfony-standard",
                    "laravel/laravel",
                    "silexphp/silex-skeleton",
                    "slim/slim-skeleton"
                ]
            },
            {
                name: "dependencies",
                message: "Add another dependency? (e.g. vendor/package:version)",
                validate: function(input) {
                    if (input.length == 0) {
                        return true;
                    }

                    if (!/^(.*)\/(.*):(.*)/.test(input)) {
                        return "Invalid package, please use the format: vendor/package:version";
                    }

                    dependencies.push(input);
                    return "Enter another dependency, or just hit enter to continue";
                }
            }];

        this.prompt(prompts, function (props) {
            this.skeleton = props.skeleton;
            this.projectName = props.projectName;
            this.dependencies = dependencies;

            done();
        }.bind(this));
    },
    composerCreateProject: function() {
        var done = this.async();

        var cmd = "composer create-project " + this.skeleton + " " + this.projectName;
        console.log("[" + chalk.yellow("Composer") + chalk.reset() + "] Creating Project...")
        exec(cmd, function (error) {
            if (error) throw error;
            console.log("[" + chalk.yellow("Composer") + chalk.reset() + "] Project created!");
            done();
        });

    },
    composerAddDependencies: function() {
        if (this.dependencies.length > 0) {
            var dependencies = this.dependencies;

            console.log("[" + chalk.yellow("Composer") + chalk.reset() + "] Adding Dependencies...");

            for (var i in dependencies) {
                this._composerInstallDependency(dependencies[i]);
            }
        }
    },
    _composerInstallDependency: function(dependency) {
        var done = this.async();
        exec("composer require " + dependency, {cwd: this.projectName}, function (error) {
            if (error) throw error;
            console.log("[" + chalk.yellow("Composer") + chalk.reset() + "] Added " + dependency);
            done();
        });
    }
});

module.exports = PhpGeneratorComposer;

