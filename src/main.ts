import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { ArgumentBuilder } from '@akiojin/argument-builder'

async function Run(): Promise<void> 
{
	try {
		const builder = new ArgumentBuilder()
			.Append('build')

		if (!!core.getInput('project')) {
			builder.Append(core.getInput('project'))
		}

		builder
			.Append('--configuration', core.getInput('configuration'))
			.Append('--output', core.getInput('output'))

		await exec.exec('dotnet', builder.Build())
	} catch (ex: any) {
		core.setFailed(ex.message);
	}
}

Run()
