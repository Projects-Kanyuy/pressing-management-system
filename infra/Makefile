
MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

CF_DIR := $(MAKEFILE_DIR)cloudformation

test:
	@echo "Validating Cloudformation templates in: $(CF_DIR)"
	for f in $$(find "$(CF_DIR)" -name \*.yaml ); do \
		AWS_PAGER="" aws cloudformation validate-template --region us-east-1 --template-body file://$$f; \
	done

cloudformation/aws-cloudformation-templates/core-components:
	@echo "Initializing Submodule with AWS Cloudformation templates"
	git submodule update --init .//cloudformation/aws-cloudformation-templates 

publish: cloudformation/aws-cloudformation-templates/core-components ## Publish Cloudformation templates to S3. usage: make publish bucket_name=my-bucket artifact_hash=123
	aws s3 sync $(CF_DIR) s3://$(bucket_name)/cloudformation/$(artifact_hash)

.PHONY: test publish